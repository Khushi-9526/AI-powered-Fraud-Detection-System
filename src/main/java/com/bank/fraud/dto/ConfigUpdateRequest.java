package com.bank.fraud.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfigUpdateRequest {
    private int riskThresholdLow;
    private int riskThresholdHigh;
    private BigDecimal maxSingleTransactionAmount;
    private int velocityLimitPer5Min;
    private int autoBlockAboveScore;
    private BigDecimal require2FAAboveAmount;
    private String aiModelType;
    private String updatedBy;
}
