export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TransactionStatus = 'APPROVED' | 'FLAGGED' | 'BLOCKED' | 'CHALLENGED';
export type AlertStatus = 'ACTIVE' | 'REVIEWED' | 'DISMISSED' | 'CONFIRMED_FRAUD' | 'BLOCKED';

export interface DeviceInfo {
  type: 'Mobile' | 'Desktop' | 'POS' | 'ATM';
  os: string;
  browser: string;
  fingerprint: string;
  isTrusted: boolean;
}

export interface LocationInfo {
  city: string;
  country: string;
  ip: string;
  flag: string;
}

export interface RiskBreakdown {
  amountRisk: number; // 0-100
  velocityRisk: number; // 0-100
  geoRisk: number; // 0-100
  merchantRisk: number; // 0-100
  deviceRisk: number; // 0-100
  behavioralRisk: number; // 0-100
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  accountNumber: string;
  amount: number;
  currency: string;
  timestamp: string;
  category: string;
  merchantOrRecipient: string;
  location: LocationInfo;
  device: DeviceInfo;
  velocityCount: number; // count in last 5 min
  riskScore: number; // 0 - 100
  status: TransactionStatus;
  anomalyReasons: string[];
  isFraud: boolean;
  riskBreakdown: RiskBreakdown;
  userNote?: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  timestamp: string;
  severity: RiskLevel;
  status: AlertStatus;
  title: string;
  description: string;
  riskScore: number;
  triggers: string[];
  userResolution?: {
    action: 'VERIFIED' | 'DISPUTED' | 'BLOCKED';
    resolvedAt: string;
    note?: string;
  };
}

export interface SystemConfig {
  riskThresholdLow: number;
  riskThresholdHigh: number;
  maxSingleTransactionAmount: number;
  velocityLimitPer5Min: number;
  geoDriftToleranceKm: number;
  require2FAAboveAmount: number;
  autoBlockAboveScore: number;
  highRiskCategories: string[];
  restrictedCountries: string[];
  aiModelType: 'ENSEMBLE_HYBRID' | 'ISOLATION_FOREST' | 'RANDOM_FOREST' | 'RULE_ENGINE_ONLY';
  featureWeights: {
    amount: number;
    velocity: number;
    geo: number;
    merchant: number;
    device: number;
    behavioral: number;
  };
  lastUpdated: string;
  updatedBy: string;
  version: number;
}

export interface ConfusionMatrix {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface Hyperparameters {
  learningRate: number;
  maxDepth: number;
  nEstimators: number;
  contaminationRate: number;
  anomalySensitivity: number;
}

export interface AlgorithmModel {
  id: string;
  name: string;
  version: string;
  type: string;
  description: string;
  accuracy: number; // % e.g. 98.4
  precision: number; // % e.g. 96.2
  recall: number; // % e.g. 94.8
  f1Score: number; // e.g. 0.955
  falsePositiveRate: number; // % e.g. 1.2
  confusionMatrix: ConfusionMatrix;
  trainingDatasetSize: number;
  lastRetrained: string;
  status: 'ACTIVE' | 'BENCHMARK' | 'ARCHIVED';
  hyperparameters: Hyperparameters;
  feedbackItemsProcessed: number;
}

export interface ModelFeedback {
  id: string;
  caseId: string;
  transactionId: string;
  timestamp: string;
  originalRiskScore: number;
  adminVerdict: 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'POLICY_VIOLATION';
  notes: string;
  retrainedInVersion?: string;
}

export interface TestCaseResult {
  id: string;
  title: string;
  category: 'Velocity' | 'Amount' | 'Geo' | 'Device' | 'Edge Case';
  passed: boolean;
  expected: string;
  actual: string;
  riskScore: number;
  details: string;
}
