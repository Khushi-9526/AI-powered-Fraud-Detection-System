package com.bank.fraud.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private boolean authenticated;
    private String token;
    private String role; // ADMIN or USER
    private String name;
    private String accountNumber;
    private String tier;
    private String message;
    private long serverTimeEpoch;
}
