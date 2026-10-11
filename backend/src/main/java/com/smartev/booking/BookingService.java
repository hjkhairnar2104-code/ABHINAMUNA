package com.smartev.booking;

import com.smartev.booking.dto.BookingHoldRequest;
import com.smartev.booking.dto.BookingHoldResponse;
import com.smartev.booking.dto.BookingResponse;
import com.smartev.booking.dto.VerifyPaymentRequest;
import com.smartev.exception.ResourceNotFoundException;
import com.smartev.exception.SlotConflictException;
import com.smartev.notification.Notification;
import com.smartev.notification.NotificationRepository;
import com.smartev.payment.Payment;
import com.smartev.payment.PaymentRepository;
import com.smartev.payment.PaymentStatus;
import com.smartev.payment.RazorpayService;
import com.smartev.slot.ParkingSlot;
import com.smartev.slot.SlotRepository;
import com.smartev.station.Station;
import com.smartev.station.StationRepository;
import com.smartev.user.User;
import com.smartev.user.UserRepository;
import com.smartev.vehicle.Vehicle;
import com.smartev.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final StationRepository stationRepository;
    private final SlotRepository slotRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final RazorpayService razorpayService;
    private final QrCodeGenerator qrCodeGenerator;
    private final StringRedisTemplate redisTemplate;

    private static final long HOLD_TTL_SECONDS = 600; // 10 minutes

    @Transactional
    public BookingHoldResponse createHold(BookingHoldRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + request.getStationId()));

        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found: " + request.getSlotId()));

        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(request.getVehicleId()).orElse(null);
        }

        // 1. Check existing overlapping bookings in DB
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                station.getId(),
                slot.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new SlotConflictException("Slot " + slot.getSlotNumber() +
                    " is already reserved or held by another user for this time window (" +
                    request.getStartTime() + " - " + request.getEndTime() + ").");
        }

        // 2. Concurrency Control with Redis Distributed Lock
        // Key format: booking:hold:{stationId}:{slotId}:{date}:{startTime}
        String redisKey = String.format("booking:hold:%d:%d:%s:%s",
                station.getId(), slot.getId(), request.getBookingDate(), request.getStartTime());

        String lockPayload = String.format("user:%d;time:%s", userId, LocalDateTime.now());
        Boolean lockAcquired = redisTemplate.opsForValue().setIfAbsent(redisKey, lockPayload, Duration.ofSeconds(HOLD_TTL_SECONDS));

        if (Boolean.FALSE.equals(lockAcquired)) {
            log.warn("Redis lock collision on key: {}", redisKey);
            throw new SlotConflictException("Slot " + slot.getSlotNumber() +
                    " was just locked by another concurrent user. Please choose another slot or time.");
        }

        // 3. Calculate price
        long minutes = ChronoUnit.MINUTES.between(request.getStartTime(), request.getEndTime());
        double hours = Math.max(1.0, minutes / 60.0);
        double kwh = request.getChargingKwh() != null ? request.getChargingKwh() : 25.0;

        double parkingCost = station.getParkingPricePerHour() * hours;
        double chargingCost = station.getChargingPricePerKwh() * kwh;
        double totalAmount = Math.round((parkingCost + chargingCost) * 100.0) / 100.0;

        String bookingRef = "SEV-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        // 4. Create Razorpay order
        String razorpayOrderId = razorpayService.createOrder(totalAmount, bookingRef);

        LocalDateTime holdExpiresAt = LocalDateTime.now().plusSeconds(HOLD_TTL_SECONDS);

        Booking booking = Booking.builder()
                .bookingReference(bookingRef)
                .user(user)
                .station(station)
                .slot(slot)
                .vehicle(vehicle)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .totalHours(hours)
                .chargingKwh(kwh)
                .totalAmount(totalAmount)
                .status(BookingStatus.HELD)
                .razorpayOrderId(razorpayOrderId)
                .holdExpiresAt(holdExpiresAt)
                .build();

        bookingRepository.save(booking);

        log.info("Slot held successfully for user {} with ref {} on slot {}", userId, bookingRef, slot.getSlotNumber());

        return BookingHoldResponse.builder()
                .bookingId(booking.getId())
                .bookingReference(bookingRef)
                .stationName(station.getName())
                .slotNumber(slot.getSlotNumber())
                .totalAmount(totalAmount)
                .razorpayOrderId(razorpayOrderId)
                .razorpayKeyId(razorpayService.getKeyId())
                .holdExpiresInSeconds((int) HOLD_TTL_SECONDS)
                .holdExpiresAt(holdExpiresAt)
                .status(BookingStatus.HELD.name())
                .message("Slot " + slot.getSlotNumber() + " is temporarily held for 10 minutes. Please complete payment.")
                .build();
    }

    @Transactional
    public BookingResponse verifyPayment(VerifyPaymentRequest request, Long userId) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized booking verification attempt");
        }

        // Verify Razorpay signature
        boolean isValid = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValid) {
            log.error("Invalid payment signature for booking {}", booking.getBookingReference());
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            // Release redis hold key
            releaseRedisKey(booking);
            throw new RuntimeException("Payment verification signature mismatch. Booking cancelled.");
        }

        // Create Payment record
        Payment payment = Payment.builder()
                .booking(booking)
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .razorpaySignature(request.getRazorpaySignature())
                .amount(booking.getTotalAmount())
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .build();
        paymentRepository.save(payment);

        // Transition booking to CONFIRMED
        booking.setStatus(BookingStatus.CONFIRMED);

        // Generate QR Code pass
        String qrContent = String.format("SmartEV Pass|Ref:%s|Station:%s|Slot:%s|Date:%s|Time:%s-%s|Amount:INR %.2f",
                booking.getBookingReference(),
                booking.getStation().getName(),
                booking.getSlot().getSlotNumber(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getTotalAmount());

        String qrBase64 = qrCodeGenerator.generateQrCodeBase64(qrContent, 280, 280);
        booking.setQrCodeBase64(qrBase64);
        bookingRepository.save(booking);

        // Release temporary Redis lock since DB now holds CONFIRMED status
        releaseRedisKey(booking);

        // Dispatch in-app notification
        Notification notif = Notification.builder()
                .user(booking.getUser())
                .title("Booking Confirmed! 🎉")
                .message(String.format("Slot %s at %s confirmed for %s (%s - %s). Digital QR pass generated.",
                        booking.getSlot().getSlotNumber(),
                        booking.getStation().getName(),
                        booking.getBookingDate(),
                        booking.getStartTime(),
                        booking.getEndTime()))
                .type("BOOKING_CONFIRMED")
                .build();
        notificationRepository.save(notif);

        log.info("Booking {} successfully verified and confirmed!", booking.getBookingReference());

        return mapToResponse(booking);
    }

    private void releaseRedisKey(Booking booking) {
        try {
            String redisKey = String.format("booking:hold:%d:%d:%s:%s",
                    booking.getStation().getId(),
                    booking.getSlot().getId(),
                    booking.getBookingDate(),
                    booking.getStartTime());
            redisTemplate.delete(redisKey);
        } catch (Exception e) {
            log.warn("Error releasing Redis key: {}", e.getMessage());
        }
    }

    @Scheduled(fixedRate = 60000) // check every minute
    @Transactional
    public void cleanupExpiredHolds() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> allBookings = bookingRepository.findAll();
        for (Booking b : allBookings) {
            if (b.getStatus() == BookingStatus.HELD && b.getHoldExpiresAt() != null && b.getHoldExpiresAt().isBefore(now)) {
                log.info("Auto-releasing expired hold on booking {}", b.getBookingReference());
                b.setStatus(BookingStatus.CANCELLED);
                bookingRepository.save(b);
                releaseRedisKey(b);
            }
        }
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingByReference(String ref) {
        Booking booking = bookingRepository.findByBookingReference(ref)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + ref));
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized cancellation attempt");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        releaseRedisKey(booking);

        Notification notif = Notification.builder()
                .user(booking.getUser())
                .title("Booking Cancelled")
                .message("Your booking " + booking.getBookingReference() + " has been cancelled.")
                .type("BOOKING_CANCELLED")
                .build();
        notificationRepository.save(notif);

        return mapToResponse(booking);
    }

    public BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .stationId(b.getStation().getId())
                .stationName(b.getStation().getName())
                .stationAddress(b.getStation().getAddress())
                .stationLat(b.getStation().getLatitude())
                .stationLng(b.getStation().getLongitude())
                .slotId(b.getSlot().getId())
                .slotNumber(b.getSlot().getSlotNumber())
                .chargerType(b.getSlot().getChargerType())
                .vehicleModel(b.getVehicle() != null ? b.getVehicle().getModel() : "EV")
                .vehicleNumber(b.getVehicle() != null ? b.getVehicle().getVehicleNumber() : "MH 12 EV 0001")
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .totalHours(b.getTotalHours())
                .chargingKwh(b.getChargingKwh())
                .totalAmount(b.getTotalAmount())
                .status(b.getStatus())
                .qrCodeBase64(b.getQrCodeBase64())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
