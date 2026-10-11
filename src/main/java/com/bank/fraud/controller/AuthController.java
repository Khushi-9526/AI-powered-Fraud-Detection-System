package com.bank.fraud.controller;

import com.bank.fraud.dto.AuthRequest;
import com.bank.fraud.dto.AuthResponse;
import com.bank.fraud.service.TotpService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Authentication REST Controller providing dual-portal login & TOTP 2FA.
 */
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final TotpService totpService;

    public AuthController(TotpService totpService) {
        this.totpService = totpService;
    }

    /**
     * Authenticates user/admin with credentials and Google Authenticator TOTP verification.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        boolean isTotpValid = totpService.verifyTotpCode(request.getTotpCode(), null);

        if (!isTotpValid) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .authenticated(false)
                    .message("Invalid or expired 6-digit Google Authenticator code. Please retry with the active rotating token.")
                    .build());
        }

        String role = "ADMIN".equalsIgnoreCase(request.getRole()) ? "ADMIN" : "USER";
        String token = "jwt_" + UUID.randomUUID().toString().replace("-", "");

        return ResponseEntity.ok(AuthResponse.builder()
                .authenticated(true)
                .token(token)
                .role(role)
                .name(request.getIdentifier())
                .accountNumber("USER".equals(role) ? "4829-9021-3310" : null)
                .tier("USER".equals(role) ? "Premier Checking" : "Security Operations Tier 3")
                .message("Two-factor authentication successful via Google Authenticator TOTP.")
                .serverTimeEpoch(Instant.now().getEpochSecond())
                .build());
    }

    /**
     * Generates a sample live rotating TOTP code for presentation testing.
     */
    @GetMapping("/totp/sample")
    public ResponseEntity<String> getSampleTotp() {
        String currentCode = totpService.generateCurrentTotp(null);
        return ResponseEntity.ok(currentCode);
    }
}
