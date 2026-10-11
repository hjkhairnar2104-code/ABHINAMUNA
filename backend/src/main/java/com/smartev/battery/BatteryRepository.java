package com.smartev.battery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatteryRepository extends JpaRepository<BatteryTelemetry, Long> {
    List<BatteryTelemetry> findByVehicleIdOrderByRecordedAtDesc(Long vehicleId);
    Optional<BatteryTelemetry> findFirstByVehicleIdOrderByRecordedAtDesc(Long vehicleId);
}
