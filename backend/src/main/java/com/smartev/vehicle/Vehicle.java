package com.smartev.vehicle;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.smartev.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @Column(nullable = false, length = 30)
    private String vehicleNumber; // e.g. MH 12 AB 1234

    @Column(nullable = false)
    private String model; // e.g. Tata Nexon EV Max

    @Column(nullable = false)
    private Double batteryCapacityKwh; // e.g. 40.5

    @Column(nullable = false)
    private String connectorType; // e.g. CCS2

    private Integer manufacturingYear;

    @Builder.Default
    private Double currentBatteryPct = 68.0;

    @Builder.Default
    private Double currentSoh = 92.4;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
