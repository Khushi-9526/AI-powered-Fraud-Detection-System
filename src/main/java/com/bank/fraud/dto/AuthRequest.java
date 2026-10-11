package com.bank.fraud.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {

    @NotBlank(message = "Portal role (ADMIN or USER) is required")
    private String role; // ADMIN or USER

    @NotBlank(message = "Identifier is required")
    private String identifier; // Account Number / User Name or Admin ID

    private String password;

    private String totpCode; // 6-digit Google Authenticator code
}
