package com.bank.fraud.dto;

import com.bank.fraud.model.RiskBreakdown;
import com.bank.fraud.model.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private String transactionId;
    private int riskScore; // 0-100
    private TransactionStatus status;
    private boolean isFraud;
    private double fraudProbability;
    private double confidencePercent;
    private String modelAlgorithm;
    private List<String> anomalyReasons;
    private RiskBreakdown riskBreakdown;
    private long inferenceTimeMs;
    private BigDecimal amount;
    private String currency;
    private String merchant;
}
