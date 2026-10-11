package com.bank.fraud;

import com.bank.fraud.dto.TransactionRequest;
import com.bank.fraud.dto.TransactionResponse;
import com.bank.fraud.model.SystemConfig;
import com.bank.fraud.model.TransactionStatus;
import com.bank.fraud.service.FraudDetectionEngine;
import com.bank.fraud.service.TotpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit Tests for Java 21 Fraud Detection Engine & TOTP Authenticator.
 */
public class FraudDetectionEngineTest {

    private FraudDetectionEngine engine;
    private TotpService totpService;
    private SystemConfig defaultConfig;

    @BeforeEach
    void setUp() {
        engine = new FraudDetectionEngine();
        totpService = new TotpService();
        defaultConfig = SystemConfig.builder()
                .version(1)
                .riskThresholdLow(40)
                .riskThresholdHigh(75)
                .maxSingleTransactionAmount(new BigDecimal("10000.00"))
                .velocityLimitPer5Min(4)
                .autoBlockAboveScore(85)
                .require2FAAboveAmount(new BigDecimal("3000.00"))
                .aiModelType("ENSEMBLE_HYBRID")
                .build();
    }

    @Test
    @DisplayName("Should approve low-risk everyday transactions")
    void testNormalApprovedTransaction() {
        TransactionRequest request = TransactionRequest.builder()
                .userId("USR-01")
                .userName("Alexander Wright")
                .accountNumber("4829-9021-3310")
                .amount(new BigDecimal("45.50"))
                .currency("USD")
                .category("Food & Dining")
                .merchant("Starbucks Coffee")
                .city("New York")
                .country("United States")
                .deviceBrowser("Mobile Safari")
                .deviceOs("iOS 18.1")
                .deviceTrusted(true)
                .velocityCount(1)
                .build();

        TransactionResponse response = engine.evaluateTransaction(request, defaultConfig);

        assertNotNull(response);
        assertEquals(TransactionStatus.APPROVED, response.getStatus());
        assertFalse(response.isFraud());
        assertTrue(response.getRiskScore() < 30);
    }

    @Test
    @DisplayName("Should block transactions exceeding maximum ceiling threshold")
    void testExcessiveAmountAutoBlock() {
        TransactionRequest request = TransactionRequest.builder()
                .userId("USR-01")
                .userName("Alexander Wright")
                .accountNumber("4829-9021-3310")
                .amount(new BigDecimal("14500.00"))
                .currency("USD")
                .category("Wire Transfer")
                .merchant("Global Swift Wire")
                .city("New York")
                .country("United States")
                .deviceTrusted(true)
                .velocityCount(1)
                .build();

        TransactionResponse response = engine.evaluateTransaction(request, defaultConfig);

        assertNotNull(response);
        assertEquals(TransactionStatus.BLOCKED, response.getStatus());
        assertTrue(response.isFraud());
        assertTrue(response.getRiskScore() >= 85);
    }

    @Test
    @DisplayName("Should block transactions initiated from sanctioned territories")
    void testSanctionedTerritoryBlock() {
        TransactionRequest request = TransactionRequest.builder()
                .userId("USR-01")
                .userName("Alexander Wright")
                .accountNumber("4829-9021-3310")
                .amount(new BigDecimal("250.00"))
                .currency("USD")
                .category("Peer-to-Peer")
                .merchant("Anonymous Escrow")
                .city("Pyongyang")
                .country("North Korea")
                .deviceTrusted(false)
                .velocityCount(1)
                .build();

        TransactionResponse response = engine.evaluateTransaction(request, defaultConfig);

        assertNotNull(response);
        assertEquals(TransactionStatus.BLOCKED, response.getStatus());
        assertTrue(response.isFraud());
        assertTrue(response.getAnomalyReasons().stream().anyMatch(r -> r.contains("sanctions")));
    }

    @Test
    @DisplayName("Should verify valid Google Authenticator TOTP token")
    void testTotpVerification() {
        String code = totpService.generateCurrentTotp(null);
        assertNotNull(code);
        assertEquals(6, code.length());
        assertTrue(totpService.verifyTotpCode(code, null));
    }
}
