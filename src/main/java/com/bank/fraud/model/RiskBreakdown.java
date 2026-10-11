package com.bank.fraud.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Multi-vector decomposed risk score components (0 - 100 each).
 */
@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskBreakdown implements Serializable {
    private int amountRisk;
    private int velocityRisk;
    private int geoRisk;
    private int merchantRisk;
    private int deviceRisk;
    private int behavioralRisk;
}
