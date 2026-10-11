import {
  Transaction,
  SystemConfig,
  RiskBreakdown,
  TransactionStatus,
  AlgorithmModel,
  ModelFeedback,
  FraudPredictionResult,
  ServletTrace,
  TrainingDataRow,
  SQLTableInfo
} from '../types/fraud';

// Simulated known baseline profile for active user
export const USER_BASELINE = {
  averageAmount: 115.00,
  stdDevAmount: 75.00,
  homeCountry: 'United States',
  homeCity: 'New York',
  typicalCategories: ['Food & Dining', 'Groceries', 'Utilities & Bills', 'Entertainment', 'Online Purchase'],
  trustedDevices: ['fp-user-alex-iphone-16', 'fp-alex-home-mac'],
  maxHistoricalSingleAmount: 1850.00
};

export interface DetectionResult {
  riskScore: number; // 0-100
  status: TransactionStatus;
  isFraud: boolean;
  anomalyReasons: string[];
  riskBreakdown: RiskBreakdown;
  prediction: FraudPredictionResult;
}

/**
 * AI & Rule-based ML Anomaly Detection Engine
 * Integrates logic from FraudDetectionEngine.java and FraudMLService.java
 */
export function analyzeTransaction(
  tx: Omit<Transaction, 'riskScore' | 'status' | 'isFraud' | 'anomalyReasons' | 'riskBreakdown' | 'prediction'>,
  config: SystemConfig,
  activeModel?: AlgorithmModel
): DetectionResult {
  const reasons: string[] = [];
  const weights = config.featureWeights;

  // 1. AMOUNT ANOMALY SCORING
  let amountRisk = 0;
  if (tx.amount > config.maxSingleTransactionAmount) {
    amountRisk = 98;
    reasons.push(`Amount ($${tx.amount.toLocaleString()}) exceeds system ceiling threshold ($${config.maxSingleTransactionAmount.toLocaleString()})`);
  } else if (tx.amount > config.require2FAAboveAmount) {
    amountRisk = Math.min(85, Math.round(50 + ((tx.amount - config.require2FAAboveAmount) / (config.maxSingleTransactionAmount - config.require2FAAboveAmount)) * 40));
    reasons.push(`High transfer value ($${tx.amount.toLocaleString()}) triggers mandatory 2FA security prompt`);
  } else {
    // Z-score deviation from baseline
    const zScore = (tx.amount - USER_BASELINE.averageAmount) / USER_BASELINE.stdDevAmount;
    if (zScore > 5) {
      amountRisk = 65;
      reasons.push(`Statistical anomaly: Amount deviates by ${zScore.toFixed(1)} standard deviations from user normal spend`);
    } else if (zScore > 3) {
      amountRisk = 40;
    } else {
      amountRisk = Math.max(3, Math.min(25, Math.round(zScore * 5 + 10)));
    }
  }

  // 2. VELOCITY ANOMALY SCORING
  let velocityRisk = 0;
  if (tx.velocityCount >= config.velocityLimitPer5Min) {
    velocityRisk = Math.min(100, 75 + (tx.velocityCount - config.velocityLimitPer5Min) * 8);
    reasons.push(`Velocity spike anomaly: ${tx.velocityCount} rapid transactions within 5-minute detection window (limit: ${config.velocityLimitPer5Min})`);
  } else if (tx.velocityCount > 2) {
    velocityRisk = Math.round((tx.velocityCount / config.velocityLimitPer5Min) * 50);
  } else {
    velocityRisk = 5;
  }

  // 3. GEOLOCATION & CROSS-BORDER ANOMALY
  let geoRisk = 0;
  const isRestrictedCountry = config.restrictedCountries.some(rc => 
    tx.location.country.toLowerCase().includes(rc.toLowerCase())
  );

  if (isRestrictedCountry) {
    geoRisk = 99;
    reasons.push(`Prohibited sanctions or proxy territory detected: ${tx.location.country}`);
  } else if (tx.location.country !== USER_BASELINE.homeCountry) {
    geoRisk = 75;
    reasons.push(`Cross-border geolocation anomaly: Transaction initiated from ${tx.location.city}, ${tx.location.country} while account home is ${USER_BASELINE.homeCountry}`);
  } else if (tx.location.city !== USER_BASELINE.homeCity) {
    geoRisk = 25;
  } else {
    geoRisk = 2;
  }

  // 4. MERCHANT & CATEGORY ANOMALY
  let merchantRisk = 0;
  const isHighRiskCategory = config.highRiskCategories.some(cat => 
    cat.toLowerCase() === tx.category.toLowerCase()
  );

  if (isHighRiskCategory) {
    merchantRisk = 85;
    reasons.push(`High-risk merchant industry classification: ${tx.category}`);
  } else if (!USER_BASELINE.typicalCategories.includes(tx.category)) {
    merchantRisk = 40;
    reasons.push(`Unusual merchant category for cardholder: ${tx.category}`);
  } else {
    merchantRisk = 5;
  }

  // 5. DEVICE & FINGERPRINT INTEGRITY
  let deviceRisk = 0;
  const isTrustedFingerprint = USER_BASELINE.trustedDevices.includes(tx.device.fingerprint) || tx.device.isTrusted;
  const isBotOrProxy = tx.device.browser.toLowerCase().includes('tor') || 
                       tx.device.browser.toLowerCase().includes('headless') || 
                       tx.device.os.toLowerCase().includes('vpn');

  if (isBotOrProxy) {
    deviceRisk = 96;
    reasons.push(`Hostile environment detected: ${tx.device.browser} / ${tx.device.os} matching known fraud vector`);
  } else if (!isTrustedFingerprint) {
    deviceRisk = 68;
    reasons.push(`Unrecognized hardware/browser device fingerprint: ${tx.device.fingerprint.slice(0, 16)}...`);
  } else {
    deviceRisk = 2;
  }

  // 6. BEHAVIORAL / MACHINE LEARNING ISOLATION SCORE
  const sensitivityMultiplier = activeModel?.hyperparameters.anomalySensitivity || 0.8;
  const rawInteraction = (amountRisk * 0.3 + velocityRisk * 0.3 + geoRisk * 0.2 + deviceRisk * 0.2);
  const behavioralRisk = Math.min(100, Math.round(rawInteraction * sensitivityMultiplier));

  const totalWeight = weights.amount + weights.velocity + weights.geo + weights.merchant + weights.device + weights.behavioral;
  
  const weightedScore = Math.round(
    (amountRisk * weights.amount +
      velocityRisk * weights.velocity +
      geoRisk * weights.geo +
      merchantRisk * weights.merchant +
      deviceRisk * weights.device +
      behavioralRisk * weights.behavioral) / (totalWeight || 100)
  );

  const finalScore = Math.min(100, Math.max(0, weightedScore));

  // Determine status and fraud flag
  let status: TransactionStatus = 'APPROVED';
  let isFraud = false;

  if (finalScore >= config.autoBlockAboveScore || geoRisk >= 95 || (amountRisk >= 95 && velocityRisk >= 70)) {
    status = 'BLOCKED';
    isFraud = true;
  } else if (finalScore >= config.riskThresholdHigh) {
    status = 'FLAGGED';
    isFraud = true;
  } else if (finalScore >= config.riskThresholdLow || tx.amount > config.require2FAAboveAmount) {
    status = 'CHALLENGED';
    isFraud = false;
  } else {
    status = 'APPROVED';
    isFraud = false;
  }

  // ML Prediction details (equivalent to FraudPrediction.java)
  const fraudProbability = Number((finalScore / 100).toFixed(3));
  const legitimateProbability = Number((1 - fraudProbability).toFixed(3));

  const prediction: FraudPredictionResult = {
    predictedClass: isFraud ? 'FRAUD' : 'LEGITIMATE',
    fraudProbability,
    legitimateProbability,
    confidencePercent: finalScore >= 50 ? finalScore : Number((100 - finalScore).toFixed(1)),
    modelAlgorithm: activeModel?.type || 'Hybrid Isolation Forest + XGBoost Regressor',
    featureImportance: {
      amountDeviation: amountRisk,
      hourOfDayAnomaly: new Date().getHours() < 5 ? 80 : 15,
      velocitySpike: velocityRisk,
      locationDistance: geoRisk,
      merchantRiskWeight: merchantRisk,
      deviceTrustFactor: deviceRisk
    }
  };

  return {
    riskScore: finalScore,
    status,
    isFraud,
    anomalyReasons: reasons,
    riskBreakdown: {
      amountRisk,
      velocityRisk,
      geoRisk,
      merchantRisk,
      deviceRisk,
      behavioralRisk
    },
    prediction
  };
}

/**
 * Creates Servlet trace simulating FraudDetectionServlet.java doPost call
 */
export function generateServletTrace(
  tx: Omit<Transaction, 'riskScore' | 'status' | 'isFraud' | 'anomalyReasons' | 'riskBreakdown' | 'prediction'>,
  detection: DetectionResult
): ServletTrace {
  return {
    endpoint: '/FraudDetectionServlet',
    method: 'POST',
    timestamp: new Date().toISOString(),
    statusCode: 200,
    requestHeaders: {
      'Host': 'localhost:8080',
      'Content-Type': 'application/json',
      'User-Agent': `${tx.device.browser} on ${tx.device.os}`,
      'X-Forwarded-For': tx.location.ip,
      'X-Device-Fingerprint': tx.device.fingerprint
    },
    requestPayload: {
      transactionId: tx.id,
      userId: tx.userId,
      amount: tx.amount,
      currency: tx.currency,
      category: tx.category,
      merchant: tx.merchantOrRecipient,
      location: tx.location,
      velocity5m: tx.velocityCount
    },
    responsePayload: {
      transactionId: tx.id,
      riskScore: detection.riskScore,
      decision: detection.status,
      isFraud: detection.isFraud,
      probability: detection.prediction.fraudProbability,
      triggers: detection.anomalyReasons
    },
    daoSqlExecuted: `INSERT INTO transactions (id, user_id, amount, category, merchant, location_city, risk_score, is_fraud, status) VALUES ('${tx.id}', '${tx.userId}', ${tx.amount}, '${tx.category}', '${tx.merchantOrRecipient.replace(/'/g, "''")}', '${tx.location.city}', ${detection.riskScore}, ${detection.isFraud ? 1 : 0}, '${detection.status}');`,
    mlInferenceTimeMs: Math.floor(8 + Math.random() * 12)
  };
}

/**
 * Retrain Algorithm with Admin Feedback & Updated Performance Metrics
 * (Implements ModelTrainer.java logic)
 */
export function retrainModel(
  currentModel: AlgorithmModel,
  feedbacks: ModelFeedback[],
  allTransactions: Transaction[]
): { updatedModel: AlgorithmModel; performanceDelta: { accuracy: number; recall: number; f1: number } } {
  const confirmedFraudCount = feedbacks.filter(f => f.adminVerdict === 'CONFIRMED_FRAUD').length;
  const falsePositiveCount = feedbacks.filter(f => f.adminVerdict === 'FALSE_POSITIVE').length;
  const totalFeedback = feedbacks.length;

  // Simulate gradient optimization & boundary refinement
  const newPrecision = Math.min(99.6, Number((currentModel.precision + (falsePositiveCount * 0.25) + 0.1).toFixed(1)));
  const newRecall = Math.min(99.2, Number((currentModel.recall + (confirmedFraudCount * 0.18) + 0.15).toFixed(1)));
  const newAccuracy = Math.min(99.8, Number((currentModel.accuracy + (totalFeedback * 0.08) + 0.1).toFixed(1)));
  const newFPR = Math.max(0.2, Number((currentModel.falsePositiveRate - (falsePositiveCount * 0.15)).toFixed(2)));
  const newF1 = Number(((2 * (newPrecision * newRecall)) / ((newPrecision + newRecall) * 100)).toFixed(3));

  const [major, minor, patch] = currentModel.version.replace('v', '').split('.').map(Number);
  const nextVersion = `v${major}.${minor}.${(patch || 0) + 1}-retrained`;

  const updatedModel: AlgorithmModel = {
    ...currentModel,
    id: `model-${nextVersion}`,
    name: `Ensemble Anomaly Forest ${nextVersion} (Trained with fraud_training.csv)`,
    version: nextVersion,
    accuracy: newAccuracy,
    precision: newPrecision,
    recall: newRecall,
    f1Score: newF1,
    falsePositiveRate: newFPR,
    lastRetrained: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    feedbackItemsProcessed: currentModel.feedbackItemsProcessed + totalFeedback,
    trainingDatasetSize: currentModel.trainingDatasetSize + allTransactions.length + 50,
    confusionMatrix: {
      truePositive: currentModel.confusionMatrix.truePositive + confirmedFraudCount + 15,
      falsePositive: Math.max(2, currentModel.confusionMatrix.falsePositive - falsePositiveCount),
      trueNegative: currentModel.confusionMatrix.trueNegative + allTransactions.filter(t => !t.isFraud).length,
      falseNegative: Math.max(12, currentModel.confusionMatrix.falseNegative - confirmedFraudCount)
    },
    hyperparameters: {
      ...currentModel.hyperparameters,
      nEstimators: currentModel.hyperparameters.nEstimators + 20,
      anomalySensitivity: Number(Math.min(0.95, currentModel.hyperparameters.anomalySensitivity + 0.03).toFixed(2))
    }
  };

  const performanceDelta = {
    accuracy: Number((newAccuracy - currentModel.accuracy).toFixed(2)),
    recall: Number((newRecall - currentModel.recall).toFixed(2)),
    f1: Number((newF1 - currentModel.f1Score).toFixed(3))
  };

  return { updatedModel, performanceDelta };
}

// Initial records for fraud_training.csv from AI-Fraud-Detection-System-main
export const INITIAL_TRAINING_DATASET: TrainingDataRow[] = [
  { id: 'TR-01', amount: 8450.00, hourOfDay: 23, velocity5m: 5, locationDevKm: 7400, merchantCategory: 'Crypto Exchange', deviceTrustScore: 10, isFraud: true, label: 'FRAUD' },
  { id: 'TR-02', amount: 14.80, hourOfDay: 8, velocity5m: 1, locationDevKm: 0, merchantCategory: 'Food & Dining', deviceTrustScore: 98, isFraud: false, label: 'LEGITIMATE' },
  { id: 'TR-03', amount: 3200.00, hourOfDay: 21, velocity5m: 3, locationDevKm: 6800, merchantCategory: 'Peer-to-Peer Wire', deviceTrustScore: 25, isFraud: true, label: 'FRAUD' },
  { id: 'TR-04', amount: 149.99, hourOfDay: 14, velocity5m: 1, locationDevKm: 120, merchantCategory: 'Online Purchase', deviceTrustScore: 95, isFraud: false, label: 'LEGITIMATE' },
  { id: 'TR-05', amount: 4950.00, hourOfDay: 2, velocity5m: 4, locationDevKm: 3200, merchantCategory: 'ATM Cash', deviceTrustScore: 30, isFraud: true, label: 'FRAUD' },
  { id: 'TR-06', amount: 85.50, hourOfDay: 16, velocity5m: 1, locationDevKm: 5, merchantCategory: 'Groceries', deviceTrustScore: 99, isFraud: false, label: 'LEGITIMATE' },
  { id: 'TR-07', amount: 12000.00, hourOfDay: 3, velocity5m: 6, locationDevKm: 4500, merchantCategory: 'Offshore Escrow', deviceTrustScore: 5, isFraud: true, label: 'FRAUD' },
  { id: 'TR-08', amount: 1.00, hourOfDay: 11, velocity5m: 8, locationDevKm: 6200, merchantCategory: 'Online Purchase', deviceTrustScore: 15, isFraud: true, label: 'FRAUD' },
  { id: 'TR-09', amount: 1250.00, hourOfDay: 9, velocity5m: 1, locationDevKm: 0, merchantCategory: 'Utilities & Bills', deviceTrustScore: 98, isFraud: false, label: 'LEGITIMATE' },
  { id: 'TR-10', amount: 38.20, hourOfDay: 12, velocity5m: 1, locationDevKm: 2, merchantCategory: 'Food & Dining', deviceTrustScore: 96, isFraud: false, label: 'LEGITIMATE' },
  { id: 'TR-11', amount: 9400.00, hourOfDay: 1, velocity5m: 7, locationDevKm: 8900, merchantCategory: 'Crypto Exchange', deviceTrustScore: 8, isFraud: true, label: 'FRAUD' },
  { id: 'TR-12', amount: 62.00, hourOfDay: 18, velocity5m: 1, locationDevKm: 10, merchantCategory: 'Groceries', deviceTrustScore: 94, isFraud: false, label: 'LEGITIMATE' }
];

// Schema definitions from fraud_detection.sql
export const DATABASE_SCHEMA: SQLTableInfo[] = [
  {
    name: 'transactions',
    description: 'Stores incoming financial transactions with calculated anomaly risk scores and fraud flags.',
    rowCount: 1420,
    columns: [
      { name: 'id', type: 'VARCHAR(64)', key: 'PRIMARY KEY' },
      { name: 'user_id', type: 'VARCHAR(64)', key: 'FOREIGN KEY' },
      { name: 'amount', type: 'DECIMAL(12,2)' },
      { name: 'category', type: 'VARCHAR(64)' },
      { name: 'merchant', type: 'VARCHAR(128)' },
      { name: 'location_city', type: 'VARCHAR(64)' },
      { name: 'risk_score', type: 'INT' },
      { name: 'is_fraud', type: 'BOOLEAN' },
      { name: 'status', type: 'VARCHAR(24)' },
      { name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  {
    name: 'fraud_alerts',
    description: 'Triggered notifications for transactions exceeding configured threshold limits.',
    rowCount: 215,
    columns: [
      { name: 'id', type: 'VARCHAR(64)', key: 'PRIMARY KEY' },
      { name: 'transaction_id', type: 'VARCHAR(64)', key: 'FOREIGN KEY' },
      { name: 'severity', type: 'VARCHAR(16)' },
      { name: 'status', type: 'VARCHAR(24)' },
      { name: 'risk_score', type: 'INT' },
      { name: 'trigger_reasons', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  {
    name: 'fraud_predictions',
    description: 'Stores ML probability distributions, feature weights, and model inference traces.',
    rowCount: 1420,
    columns: [
      { name: 'id', type: 'VARCHAR(64)', key: 'PRIMARY KEY' },
      { name: 'transaction_id', type: 'VARCHAR(64)', key: 'FOREIGN KEY' },
      { name: 'fraud_prob', type: 'DECIMAL(5,4)' },
      { name: 'confidence', type: 'DECIMAL(5,2)' },
      { name: 'model_version', type: 'VARCHAR(32)' },
      { name: 'inference_ms', type: 'INT' }
    ]
  },
  {
    name: 'system_configurations',
    description: 'Configuration settings defining threshold boundaries and algorithm parameters.',
    rowCount: 8,
    columns: [
      { name: 'version', type: 'INT', key: 'PRIMARY KEY' },
      { name: 'risk_threshold_low', type: 'INT' },
      { name: 'risk_threshold_high', type: 'INT' },
      { name: 'max_single_amount', type: 'DECIMAL(12,2)' },
      { name: 'velocity_limit_5min', type: 'INT' },
      { name: 'feature_weights_json', type: 'JSON' },
      { name: 'updated_by', type: 'VARCHAR(64)' }
    ]
  }
];
