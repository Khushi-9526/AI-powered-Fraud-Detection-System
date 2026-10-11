-- ===================================================================
-- AI-Powered Fraud Detection System Database Schema (DDL)
-- Dialect: ANSI SQL / H2 / MySQL Compatible
-- ===================================================================

CREATE TABLE IF NOT EXISTS system_configurations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    version INT NOT NULL,
    risk_threshold_low INT NOT NULL,
    risk_threshold_high INT NOT NULL,
    max_single_amount DECIMAL(12,2) NOT NULL,
    velocity_limit_5min INT NOT NULL,
    auto_block_above_score INT NOT NULL,
    require_2fa_above_amount DECIMAL(12,2) NOT NULL,
    ai_model_type VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    account_number VARCHAR(32) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(8) NOT NULL,
    category VARCHAR(64) NOT NULL,
    merchant VARCHAR(128) NOT NULL,
    location_city VARCHAR(64) NOT NULL,
    location_country VARCHAR(64) NOT NULL,
    location_ip VARCHAR(64),
    device_fingerprint VARCHAR(128),
    device_os VARCHAR(64),
    device_browser VARCHAR(64),
    device_is_trusted BOOLEAN DEFAULT FALSE,
    velocity_count_5m INT DEFAULT 1,
    risk_score INT NOT NULL,
    status VARCHAR(24) NOT NULL,
    is_fraud BOOLEAN DEFAULT FALSE,
    anomaly_reasons TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    status VARCHAR(24) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_score INT NOT NULL,
    triggers TEXT,
    user_resolution VARCHAR(32),
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fraud_predictions (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL,
    predicted_class VARCHAR(16) NOT NULL,
    fraud_probability DECIMAL(6,4) NOT NULL,
    legitimate_probability DECIMAL(6,4) NOT NULL,
    confidence_percent DECIMAL(5,2) NOT NULL,
    model_algorithm VARCHAR(128) NOT NULL,
    inference_time_ms INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS model_feedback_audit (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL,
    admin_id VARCHAR(64) NOT NULL,
    admin_verdict VARCHAR(32) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
