package com.bank.fraud.controller;

import com.bank.fraud.dto.TransactionRequest;
import com.bank.fraud.dto.TransactionResponse;
import com.bank.fraud.model.FraudAlert;
import com.bank.fraud.model.RiskLevel;
import com.bank.fraud.model.SystemConfig;
import com.bank.fraud.model.Transaction;
import com.bank.fraud.repository.FraudAlertRepository;
import com.bank.fraud.repository.SystemConfigRepository;
import com.bank.fraud.repository.TransactionRepository;
import com.bank.fraud.service.FraudDetectionEngine;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Transaction Controller handling real-time payments, simulation sandbox, and customer alert resolutions.
 */
@RestController
@RequestMapping("/api/v1/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final FraudDetectionEngine fraudEngine;
    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final SystemConfigRepository systemConfigRepository;

    public TransactionController(FraudDetectionEngine fraudEngine,
                                 TransactionRepository transactionRepository,
                                 FraudAlertRepository fraudAlertRepository,
                                 SystemConfigRepository systemConfigRepository) {
        this.fraudEngine = fraudEngine;
        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
        this.systemConfigRepository = systemConfigRepository;
    }

    /**
     * Real-time transaction ingestion and ML anomaly scoring endpoint.
     */
    @PostMapping("/analyze")
    public ResponseEntity<TransactionResponse> analyzeTransaction(@Valid @RequestBody TransactionRequest request) {
        SystemConfig config = systemConfigRepository.findTopByOrderByVersionDesc()
                .orElse(getDefaultConfig());

        TransactionResponse response = fraudEngine.evaluateTransaction(request, config);

        // Persist transaction record
        Transaction tx = Transaction.builder()
                .id(response.getTransactionId())
                .userId(request.getUserId())
                .userName(request.getUserName())
                .accountNumber(request.getAccountNumber())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .category(request.getCategory())
                .merchant(request.getMerchant())
                .locationCity(request.getCity())
                .locationCountry(request.getCountry())
                .locationIp(request.getIpAddress())
                .deviceFingerprint(request.getDeviceFingerprint())
                .deviceOs(request.getDeviceOs())
                .deviceBrowser(request.getDeviceBrowser())
                .deviceIsTrusted(request.getDeviceTrusted())
                .velocityCount(request.getVelocityCount())
                .riskScore(response.getRiskScore())
                .status(response.getStatus())
                .isFraud(response.isFraud())
                .anomalyReasons(String.join("; ", response.getAnomalyReasons()))
                .riskBreakdown(response.getRiskBreakdown())
                .createdAt(LocalDateTime.now())
                .build();

        transactionRepository.save(tx);

        // If risk triggers an alert, persist it into fraud_alerts table
        if (response.getRiskScore() >= config.getRiskThresholdLow()) {
            RiskLevel severity = response.getRiskScore() >= 85 ? RiskLevel.CRITICAL :
                                 response.getRiskScore() >= 65 ? RiskLevel.HIGH : RiskLevel.MEDIUM;

            FraudAlert alert = FraudAlert.builder()
                    .id("ALT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                    .transactionId(tx.getId())
                    .userId(request.getUserId())
                    .userName(request.getUserName())
                    .severity(severity)
                    .status("ACTIVE")
                    .title("Suspicious Activity: " + request.getCategory() + " ($" + request.getAmount() + ")")
                    .description("Anomaly detected: " + String.join(", ", response.getAnomalyReasons()))
                    .riskScore(response.getRiskScore())
                    .triggers(String.join("; ", response.getAnomalyReasons()))
                    .createdAt(LocalDateTime.now())
                    .build();

            fraudAlertRepository.save(alert);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Retrieve transactions for customer portal.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable String userId) {
        return ResponseEntity.ok(transactionRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    /**
     * Customer resolution for an alert (Verify or Dispute & Block).
     */
    @PostMapping("/alerts/{alertId}/resolve")
    public ResponseEntity<FraudAlert> resolveAlert(
            @PathVariable String alertId,
            @RequestParam String action,
            @RequestParam(required = false) String note) {

        return fraudAlertRepository.findById(alertId).map(alert -> {
            alert.setStatus("RESOLVED");
            alert.setUserResolution(action);
            alert.setResolvedAt(LocalDateTime.now());
            fraudAlertRepository.save(alert);
            return ResponseEntity.ok(alert);
        }).orElse(ResponseEntity.notFound().build());
    }

    private SystemConfig getDefaultConfig() {
        return SystemConfig.builder()
                .version(1)
                .riskThresholdLow(40)
                .riskThresholdHigh(75)
                .maxSingleTransactionAmount(new BigDecimal("10000.00"))
                .velocityLimitPer5Min(4)
                .autoBlockAboveScore(85)
                .require2FAAboveAmount(new BigDecimal("3000.00"))
                .aiModelType("ENSEMBLE_HYBRID")
                .updatedBy("System Initializer")
                .build();
    }
}
