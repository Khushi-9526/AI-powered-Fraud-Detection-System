package com.bank.fraud.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * SystemConfig JPA Entity storing real-time fraud mitigation rules and thresholds.
 */
@Entity
@Table(name = "system_configurations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer version;

    @Column(name = "risk_threshold_low", nullable = false)
    private Integer riskThresholdLow;

    @Column(name = "risk_threshold_high", nullable = false)
    private Integer riskThresholdHigh;

    @Column(name = "max_single_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal maxSingleTransactionAmount;

    @Column(name = "velocity_limit_5min", nullable = false)
    private Integer velocityLimitPer5Min;

    @Column(name = "auto_block_above_score", nullable = false)
    private Integer autoBlockAboveScore;

    @Column(name = "require_2fa_above_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal require2FAAboveAmount;

    @Column(name = "ai_model_type", length = 64, nullable = false)
    private String aiModelType;

    @Column(name = "updated_by", length = 64)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
