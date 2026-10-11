package com.bank.fraud.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Transaction JPA Entity representing evaluated payment events.
 */
@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "user_name", nullable = false, length = 128)
    private String userName;

    @Column(name = "account_number", nullable = false, length = 32)
    private String accountNumber;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 8, nullable = false)
    private String currency;

    @Column(length = 64, nullable = false)
    private String category;

    @Column(length = 128, nullable = false)
    private String merchant;

    @Column(name = "location_city", length = 64)
    private String locationCity;

    @Column(name = "location_country", length = 64)
    private String locationCountry;

    @Column(name = "location_ip", length = 64)
    private String locationIp;

    @Column(name = "device_fingerprint", length = 128)
    private String deviceFingerprint;

    @Column(name = "device_os", length = 64)
    private String deviceOs;

    @Column(name = "device_browser", length = 64)
    private String deviceBrowser;

    @Column(name = "device_is_trusted")
    private Boolean deviceIsTrusted;

    @Column(name = "velocity_count_5m")
    private Integer velocityCount;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Enumerated(EnumType.STRING)
    @Column(length = 24, nullable = false)
    private TransactionStatus status;

    @Column(name = "is_fraud")
    private Boolean isFraud;

    @Column(name = "anomaly_reasons", columnDefinition = "TEXT")
    private String anomalyReasons;

    @Embedded
    private RiskBreakdown riskBreakdown;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
