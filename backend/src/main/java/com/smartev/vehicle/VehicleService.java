package com.smartev.vehicle;

import com.smartev.exception.ResourceNotFoundException;
import com.smartev.user.User;
import com.smartev.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Vehicle> getUserVehicles(Long userId) {
        return vehicleRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));
    }

    @Transactional
    public Vehicle addVehicle(Vehicle vehicle, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        vehicle.setUser(user);
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(Long id, Vehicle updated, Long userId) {
        Vehicle existing = getVehicleById(id);
        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized vehicle update");
        }
        existing.setVehicleNumber(updated.getVehicleNumber());
        existing.setModel(updated.getModel());
        existing.setBatteryCapacityKwh(updated.getBatteryCapacityKwh());
        existing.setConnectorType(updated.getConnectorType());
        existing.setManufacturingYear(updated.getManufacturingYear());
        if (updated.getCurrentBatteryPct() != null) {
            existing.setCurrentBatteryPct(updated.getCurrentBatteryPct());
        }
        if (updated.getCurrentSoh() != null) {
            existing.setCurrentSoh(updated.getCurrentSoh());
        }
        return vehicleRepository.save(existing);
    }

    @Transactional
    public void deleteVehicle(Long id, Long userId) {
        Vehicle existing = getVehicleById(id);
        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized vehicle deletion");
        }
        vehicleRepository.delete(existing);
    }
}
