package com.bank.fraud.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * FraudAlert JPA Entity representing customer and admin-facing threat alarms.
 */
@Entity
@Table(name = "fraud_alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlert {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "transaction_id", nullable = false, length = 64)
    private String transactionId;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "user_name", nullable = false, length = 128)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    private RiskLevel severity;

    @Column(length = 24, nullable = false)
    private String status; // ACTIVE, RESOLVED, VERIFIED, DISPUTED, BLOCKED

    @Column(length = 255, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(columnDefinition = "TEXT")
    private String triggers;

    @Column(name = "user_resolution", length = 32)
    private String userResolution;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
