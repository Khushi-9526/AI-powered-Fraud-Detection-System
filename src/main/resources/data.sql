-- Seed Data for AI Fraud Detection System

INSERT INTO system_configurations (id, version, risk_threshold_low, risk_threshold_high, max_single_amount, velocity_limit_5min, auto_block_above_score, require_2fa_above_amount, ai_model_type, updated_by)
VALUES (1, 1, 40, 75, 10000.00, 4, 85, 3000.00, 'ENSEMBLE_HYBRID', 'System Administrator');

INSERT INTO transactions (id, user_id, user_name, account_number, amount, currency, category, merchant, location_city, location_country, location_ip, device_fingerprint, device_os, device_browser, device_is_trusted, velocity_count_5m, risk_score, status, is_fraud, anomaly_reasons)
VALUES 
('TX-9841', 'USR-01', 'Alexander Wright', '4829-9021-3310', 4850.00, 'USD', 'Peer-to-Peer Wire', 'FastWire Global Remit', 'St. Petersburg', 'Russia', '185.220.101.5', 'fp-unknown-tor-node-882', 'Linux x86_64', 'Tor Browser 13.0', FALSE, 5, 96, 'BLOCKED', TRUE, 'Prohibited sanctions territory: Russia; High velocity spike (5 transactions in 5 min); Untrusted Tor proxy'),
('TX-9842', 'USR-01', 'Alexander Wright', '4829-9021-3310', 42.50, 'USD', 'Food & Dining', 'Blue Bottle Coffee', 'New York', 'United States', '74.125.20.1', 'fp-user-alex-iphone-16', 'iOS 18.1', 'Mobile Safari', TRUE, 1, 6, 'APPROVED', FALSE, 'Normal habitual expenditure; Trusted device'),
('TX-9843', 'USR-01', 'Alexander Wright', '4829-9021-3310', 1420.00, 'USD', 'Electronics', 'TechZone Megastore', 'Miami', 'United States', '198.51.100.22', 'fp-user-alex-iphone-16', 'iOS 18.1', 'Mobile Safari', TRUE, 1, 48, 'CHALLENGED', FALSE, 'Statistical spend deviation (3.2 std deviations); Stepped up for 2FA review'),
('TX-9844', 'USR-02', 'Elena Rostova', '9012-4421-1189', 8900.00, 'USD', 'Crypto Exchange', 'CoinNexus OTC Desk', 'Nicosia', 'Cyprus', '91.240.118.4', 'fp-elena-new-device-41', 'Windows 11', 'Chrome 128', FALSE, 4, 91, 'BLOCKED', TRUE, 'High-risk crypto OTC; Unrecognized device fingerprint; Spiked velocity');
