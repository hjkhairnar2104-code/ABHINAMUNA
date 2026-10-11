package com.smartev.battery;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.smartev.vehicle.Vehicle;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "battery_telemetry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatteryTelemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Vehicle vehicle;

    private Double voltage; // V
    private Double current; // A
    private Double temperature; // °C
    private Double capacity; // Ah
    private Double internalResistance; // mOhm
    private Integer chargeCycles;
    private Double chargingTime; // min
    private Double dischargingTime; // min
    private Double energyThroughput; // kWh

    private Double predictedSoh; // %
    private Integer predictedRulCycles;
    private String healthStatus; // EXCELLENT, GOOD, MODERATE, CRITICAL

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime recordedAt;
}
