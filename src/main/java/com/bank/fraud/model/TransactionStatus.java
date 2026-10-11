package com.bank.fraud.model;

/**
 * Transaction processing outcome evaluated by the Java ML Fraud Engine.
 */
public enum TransactionStatus {
    APPROVED,
    CHALLENGED,
    FLAGGED,
    BLOCKED
}
