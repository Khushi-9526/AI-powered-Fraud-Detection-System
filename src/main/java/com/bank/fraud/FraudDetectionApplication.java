package com.bank.fraud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * AI-Powered Fraud Detection System
 * Enterprise Java 21 & Spring Boot 3.2.x REST Engine
 *
 * Implements real-time financial transaction monitoring, multi-vector ML anomaly scoring,
 * rule-based adaptive thresholding, and Google Authenticator (RFC 6238 TOTP) verification.
 */
@SpringBootApplication
@EnableScheduling
@ConfigurationPropertiesScan
public class FraudDetectionApplication {

    public static void main(String[] args) {
        SpringApplication.run(FraudDetectionApplication.class, args);
        System.out.println("=================================================================");
        System.out.println(" AI-POWERED FRAUD DETECTION ENGINE (JAVA 21 / SPRING BOOT 3)");
        System.out.println(" Real-time Multi-Vector ML Scoring Server Running on Port 8080");
        System.out.println(" Embedded H2 Console: http://localhost:8080/h2-console");
        System.out.println(" Actuator Metrics: http://localhost:8080/actuator/health");
        System.out.println("=================================================================");
    }
}
