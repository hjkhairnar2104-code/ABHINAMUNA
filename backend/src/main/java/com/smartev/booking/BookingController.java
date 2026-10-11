package com.smartev.booking;

import com.smartev.booking.dto.BookingHoldRequest;
import com.smartev.booking.dto.BookingHoldResponse;
import com.smartev.booking.dto.BookingResponse;
import com.smartev.booking.dto.VerifyPaymentRequest;
import com.smartev.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Date/Time slot reservation, Redis holds, and Razorpay payment verification")
public class BookingController {

    private final BookingService bookingService;
    private final JwtUtils jwtUtils;

    private Long getUserIdFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return 1L; // fallback demo driver
        }
        String token = authHeader.substring(7);
        return jwtUtils.extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    @PostMapping("/hold")
    @Operation(summary = "Create temporary 10-minute slot hold using Redis distributed lock")
    public ResponseEntity<BookingHoldResponse> holdSlot(
            @Valid @RequestBody BookingHoldRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        BookingHoldResponse response = bookingService.createHold(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-payment")
    @Operation(summary = "Verify Razorpay payment signature and confirm booking")
    public ResponseEntity<BookingResponse> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        BookingResponse response = bookingService.verifyPayment(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Get list of all bookings for the authenticated user")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping("/{ref}")
    @Operation(summary = "Get booking details and digital QR pass by booking reference")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable String ref) {
        return ResponseEntity.ok(bookingService.getBookingByReference(ref));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an existing booking and release slot")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }
}
