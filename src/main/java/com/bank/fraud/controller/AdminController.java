package com.bank.fraud.controller;

import com.bank.fraud.dto.ConfigUpdateRequest;
import com.bank.fraud.model.FraudAlert;
import com.bank.fraud.model.SystemConfig;
import com.bank.fraud.model.Transaction;
import com.bank.fraud.repository.FraudAlertRepository;
import com.bank.fraud.repository.SystemConfigRepository;
import com.bank.fraud.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Security Console REST Controller.
 * Provides system configuration adjustments, detection audits, and live ML performance stats.
 */
@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final SystemConfigRepository configRepository;
    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository alertRepository;

    public AdminController(SystemConfigRepository configRepository,
                           TransactionRepository transactionRepository,
                           FraudAlertRepository alertRepository) {
        this.configRepository = configRepository;
        this.transactionRepository = transactionRepository;
        this.alertRepository = alertRepository;
    }

    /**
     * Get active threshold configuration.
     */
    @GetMapping("/config")
    public ResponseEntity<SystemConfig> getActiveConfig() {
        return ResponseEntity.ok(configRepository.findTopByOrderByVersionDesc()
                .orElseGet(this::createDefaultConfig));
    }

    /**
     * Save updated system configuration thresholds.
     */
    @PostMapping("/config")
    public ResponseEntity<SystemConfig> updateConfig(@RequestBody ConfigUpdateRequest req) {
        int nextVersion = configRepository.findTopByOrderByVersionDesc()
                .map(c -> c.getVersion() + 1)
                .orElse(1);

        SystemConfig newConfig = SystemConfig.builder()
                .version(nextVersion)
                .riskThresholdLow(req.getRiskThresholdLow())
                .riskThresholdHigh(req.getRiskThresholdHigh())
                .maxSingleTransactionAmount(req.getMaxSingleTransactionAmount())
                .velocityLimitPer5Min(req.getVelocityLimitPer5Min())
                .autoBlockAboveScore(req.getAutoBlockAboveScore())
                .require2FAAboveAmount(req.getRequire2FAAboveAmount())
                .aiModelType(req.getAiModelType() != null ? req.getAiModelType() : "ENSEMBLE_HYBRID")
                .updatedBy(req.getUpdatedBy() != null ? req.getUpdatedBy() : "Admin Security Officer")
                .build();

        return ResponseEntity.ok(configRepository.save(newConfig));
    }

    /**
     * Retrieve all audited transactions for reporting.
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionRepository.findAll());
    }

    /**
     * Retrieve all fraud alerts.
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<FraudAlert>> getAllAlerts() {
        return ResponseEntity.ok(alertRepository.findAll());
    }

    /**
     * Live metrics summary for Admin Dashboard.
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getSystemMetrics() {
        long totalTransactions = transactionRepository.count();
        List<Transaction> fraudTxs = transactionRepository.findByIsFraudTrueOrderByCreatedAtDesc();
        long totalAlerts = alertRepository.count();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalTransactions", totalTransactions);
        metrics.put("fraudInterceptedCount", fraudTxs.size());
        metrics.put("activeAlertsCount", totalAlerts);
        metrics.put("engineVersion", "4.2.0-JAVA-SPRING");
        metrics.put("jvmVersion", System.getProperty("java.version", "21-LTS"));
        metrics.put("activeThreads", Thread.activeCount());
        metrics.put("memoryTotalMb", Runtime.getRuntime().totalMemory() / (1024 * 1024));
        metrics.put("memoryFreeMb", Runtime.getRuntime().freeMemory() / (1024 * 1024));

        return ResponseEntity.ok(metrics);
    }

    private SystemConfig createDefaultConfig() {
        SystemConfig config = SystemConfig.builder()
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
        return configRepository.save(config);
    }
}
