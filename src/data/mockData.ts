import { Transaction, FraudAlert, SystemConfig, AlgorithmModel, ModelFeedback } from '../types/fraud';

export const initialSystemConfig: SystemConfig = {
  riskThresholdLow: 30,
  riskThresholdHigh: 70,
  maxSingleTransactionAmount: 5000,
  velocityLimitPer5Min: 4,
  geoDriftToleranceKm: 600,
  require2FAAboveAmount: 1500,
  autoBlockAboveScore: 85,
  highRiskCategories: [
    'Crypto Exchange',
    'Offshore Escrow',
    'High-Stake Gaming',
    'Peer-to-Peer Wire',
    'Prepaid Gift Cards'
  ],
  restrictedCountries: ['North Korea', 'Syria', 'Iran', 'Anonymous Proxy / Tor'],
  aiModelType: 'ENSEMBLE_HYBRID',
  featureWeights: {
    amount: 25,
    velocity: 20,
    geo: 20,
    merchant: 15,
    device: 10,
    behavioral: 10
  },
  lastUpdated: '2026-10-10 09:30:00 UTC',
  updatedBy: 'Admin (Security Operations)',
  version: 3
};

export const initialAlgorithmModels: AlgorithmModel[] = [
  {
    id: 'model-v2.4',
    name: 'Ensemble Anomaly Forest v2.4 (Active)',
    version: 'v2.4.1',
    type: 'Hybrid Isolation Forest + XGBoost Risk Regressor',
    description: 'Ensemble model incorporating isolation tree anomaly scoring with gradient-boosted decision trees trained on 2.4M multi-vector transactions.',
    accuracy: 98.7,
    precision: 96.8,
    recall: 95.4,
    f1Score: 0.961,
    falsePositiveRate: 0.8,
    confusionMatrix: {
      truePositive: 1420,
      falsePositive: 12,
      trueNegative: 45890,
      falseNegative: 68
    },
    trainingDatasetSize: 47390,
    lastRetrained: '2026-10-09 14:15:22 UTC',
    status: 'ACTIVE',
    hyperparameters: {
      learningRate: 0.045,
      maxDepth: 6,
      nEstimators: 180,
      contaminationRate: 0.03,
      anomalySensitivity: 0.82
    },
    feedbackItemsProcessed: 28
  },
  {
    id: 'model-v2.3',
    name: 'Deep Risk Network v2.3',
    version: 'v2.3.0',
    type: 'Multi-layer Perceptron Neural Network',
    description: 'Deep neural network with embeddings for cardholder behavior profiles and temporal velocity patterns.',
    accuracy: 97.2,
    precision: 94.1,
    recall: 93.9,
    f1Score: 0.940,
    falsePositiveRate: 1.6,
    confusionMatrix: {
      truePositive: 1390,
      falsePositive: 24,
      trueNegative: 45800,
      falseNegative: 92
    },
    trainingDatasetSize: 42000,
    lastRetrained: '2026-09-24 10:00:00 UTC',
    status: 'BENCHMARK',
    hyperparameters: {
      learningRate: 0.02,
      maxDepth: 8,
      nEstimators: 120,
      contaminationRate: 0.04,
      anomalySensitivity: 0.78
    },
    feedbackItemsProcessed: 14
  },
  {
    id: 'model-v1.8',
    name: 'Rule Heuristics & Logistic Regressor v1.8',
    version: 'v1.8.4',
    type: 'Baseline Statistical Logistic Model',
    description: 'Lightweight heuristic baseline model relying on threshold boundary constraints and static velocity counters.',
    accuracy: 94.3,
    precision: 89.2,
    recall: 88.0,
    f1Score: 0.886,
    falsePositiveRate: 3.5,
    confusionMatrix: {
      truePositive: 1210,
      falsePositive: 52,
      trueNegative: 45400,
      falseNegative: 170
    },
    trainingDatasetSize: 35000,
    lastRetrained: '2026-08-12 18:30:00 UTC',
    status: 'ARCHIVED',
    hyperparameters: {
      learningRate: 0.01,
      maxDepth: 4,
      nEstimators: 50,
      contaminationRate: 0.05,
      anomalySensitivity: 0.65
    },
    feedbackItemsProcessed: 42
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'TX-90412',
    userId: 'USR-8821',
    userName: 'Alexander Wright',
    accountNumber: '**** **** 4829',
    amount: 8450.00,
    currency: 'USD',
    timestamp: '2026-10-10 22:42:15',
    category: 'Crypto Exchange',
    merchantOrRecipient: 'BitVault Escrow Global Inc.',
    location: {
      city: 'Lagos',
      country: 'Nigeria',
      ip: '197.210.226.4',
      flag: '🇳🇬'
    },
    device: {
      type: 'Desktop',
      os: 'Linux x86_64',
      browser: 'Tor Browser 13.5',
      fingerprint: 'fp-99x-anon-proxy-001',
      isTrusted: false
    },
    velocityCount: 5,
    riskScore: 94,
    status: 'BLOCKED',
    anomalyReasons: [
      'Impossible travel velocity: 7,400km jump within 35 minutes of NY transaction',
      'High-risk category (Crypto Exchange) exceeds $5,000 threshold',
      'High velocity attack: 5 consecutive attempts in 3 minutes',
      'Untrusted device running anonymized Tor browser node'
    ],
    isFraud: true,
    riskBreakdown: {
      amountRisk: 92,
      velocityRisk: 95,
      geoRisk: 98,
      merchantRisk: 88,
      deviceRisk: 95,
      behavioralRisk: 90
    }
  },
  {
    id: 'TX-90409',
    userId: 'USR-8821',
    userName: 'Alexander Wright',
    accountNumber: '**** **** 4829',
    amount: 14.80,
    currency: 'USD',
    timestamp: '2026-10-10 22:07:00',
    category: 'Food & Dining',
    merchantOrRecipient: 'Blue Bottle Coffee Manhattan',
    location: {
      city: 'New York',
      country: 'United States',
      ip: '68.192.12.84',
      flag: '🇺🇸'
    },
    device: {
      type: 'Mobile',
      os: 'iOS 19.1',
      browser: 'Mobile Safari',
      fingerprint: 'fp-user-alex-iphone-16',
      isTrusted: true
    },
    velocityCount: 1,
    riskScore: 6,
    status: 'APPROVED',
    anomalyReasons: [],
    isFraud: false,
    riskBreakdown: {
      amountRisk: 4,
      velocityRisk: 5,
      geoRisk: 2,
      merchantRisk: 3,
      deviceRisk: 1,
      behavioralRisk: 5
    }
  },
  {
    id: 'TX-90398',
    userId: 'USR-8821',
    userName: 'Alexander Wright',
    accountNumber: '**** **** 4829',
    amount: 3200.00,
    currency: 'USD',
    timestamp: '2026-10-10 21:18:40',
    category: 'Peer-to-Peer Wire',
    merchantOrRecipient: 'Wire Transfer to Dmitry Petrov',
    location: {
      city: 'Minsk',
      country: 'Belarus',
      ip: '178.120.44.19',
      flag: '🇧🇾'
    },
    device: {
      type: 'Mobile',
      os: 'Android 14',
      browser: 'Chrome Mobile',
      fingerprint: 'fp-unregistered-device-882',
      isTrusted: false
    },
    velocityCount: 3,
    riskScore: 78,
    status: 'FLAGGED',
    anomalyReasons: [
      'Unrecognized device attempting large foreign P2P transfer',
      'Transaction triggered multi-factor challenge requirement ($3,200 > $1,500)',
      'Cross-border destination flagged for elevated wire risk'
    ],
    isFraud: true,
    riskBreakdown: {
      amountRisk: 75,
      velocityRisk: 68,
      geoRisk: 84,
      merchantRisk: 72,
      deviceRisk: 80,
      behavioralRisk: 79
    }
  },
  {
    id: 'TX-90377',
    userId: 'USR-5140',
    userName: 'Elena Rostova',
    accountNumber: '**** **** 9012',
    amount: 149.99,
    currency: 'USD',
    timestamp: '2026-10-10 19:45:11',
    category: 'Online Purchase',
    merchantOrRecipient: 'Amazon Marketplace US',
    location: {
      city: 'Seattle',
      country: 'United States',
      ip: '73.181.99.12',
      flag: '🇺🇸'
    },
    device: {
      type: 'Desktop',
      os: 'macOS Sonoma',
      browser: 'Google Chrome 130',
      fingerprint: 'fp-elena-macbook-pro',
      isTrusted: true
    },
    velocityCount: 1,
    riskScore: 12,
    status: 'APPROVED',
    anomalyReasons: [],
    isFraud: false,
    riskBreakdown: {
      amountRisk: 10,
      velocityRisk: 8,
      geoRisk: 5,
      merchantRisk: 7,
      deviceRisk: 3,
      behavioralRisk: 12
    }
  },
  {
    id: 'TX-90355',
    userId: 'USR-3392',
    userName: 'Marcus Sterling',
    accountNumber: '**** **** 6773',
    amount: 4950.00,
    currency: 'USD',
    timestamp: '2026-10-10 18:22:04',
    category: 'ATM Cash',
    merchantOrRecipient: 'Standalone Casino ATM #401',
    location: {
      city: 'Las Vegas',
      country: 'United States',
      ip: '198.54.120.3',
      flag: '🇺🇸'
    },
    device: {
      type: 'ATM',
      os: 'Windows Embedded',
      browser: 'ATM Terminal 2.1',
      fingerprint: 'atm-pos-vegas-401',
      isTrusted: false
    },
    velocityCount: 4,
    riskScore: 82,
    status: 'FLAGGED',
    anomalyReasons: [
      'Maximum daily ATM cash withdrawal ceiling ($4,950 close to $5,000 threshold)',
      'Burst pattern: 4 consecutive ATM balance inquiries & cash pull attempts',
      'High-risk merchant terminal category: Casino gaming zone'
    ],
    isFraud: true,
    riskBreakdown: {
      amountRisk: 88,
      velocityRisk: 82,
      geoRisk: 60,
      merchantRisk: 85,
      deviceRisk: 74,
      behavioralRisk: 81
    }
  },
  {
    id: 'TX-90320',
    userId: 'USR-8821',
    userName: 'Alexander Wright',
    accountNumber: '**** **** 4829',
    amount: 85.50,
    currency: 'USD',
    timestamp: '2026-10-10 16:10:00',
    category: 'Groceries',
    merchantOrRecipient: 'Whole Foods Market Tribeca',
    location: {
      city: 'New York',
      country: 'United States',
      ip: '68.192.12.84',
      flag: '🇺🇸'
    },
    device: {
      type: 'POS',
      os: 'Verifone OS',
      browser: 'Contactless EMV Chip',
      fingerprint: 'pos-wfm-nyc-terminal-11',
      isTrusted: true
    },
    velocityCount: 1,
    riskScore: 8,
    status: 'APPROVED',
    anomalyReasons: [],
    isFraud: false,
    riskBreakdown: {
      amountRisk: 8,
      velocityRisk: 6,
      geoRisk: 4,
      merchantRisk: 2,
      deviceRisk: 1,
      behavioralRisk: 4
    }
  },
  {
    id: 'TX-90299',
    userId: 'USR-7714',
    userName: 'Sarah Jenkins',
    accountNumber: '**** **** 1290',
    amount: 12000.00,
    currency: 'USD',
    timestamp: '2026-10-10 14:05:30',
    category: 'Offshore Escrow',
    merchantOrRecipient: 'Cayman Global Wealth Transfer',
    location: {
      city: 'George Town',
      country: 'Cayman Islands',
      ip: '190.10.45.18',
      flag: '🇰🇾'
    },
    device: {
      type: 'Desktop',
      os: 'Unknown / VPN Proxy',
      browser: 'Headless Chrome Automation',
      fingerprint: 'fp-bot-headless-0921',
      isTrusted: false
    },
    velocityCount: 6,
    riskScore: 98,
    status: 'BLOCKED',
    anomalyReasons: [
      'Exceeds maximum allowable transaction amount ($12,000 > $5,000 threshold)',
      'Automated headless browser script detected during transaction submission',
      'Offshore high-risk beneficiary destination',
      'Critical risk score: 98/100 triggers automated safety lockdown'
    ],
    isFraud: true,
    riskBreakdown: {
      amountRisk: 99,
      velocityRisk: 96,
      geoRisk: 95,
      merchantRisk: 98,
      deviceRisk: 99,
      behavioralRisk: 97
    }
  },
  {
    id: 'TX-90264',
    userId: 'USR-8821',
    userName: 'Alexander Wright',
    accountNumber: '**** **** 4829',
    amount: 1.00,
    currency: 'USD',
    timestamp: '2026-10-10 11:58:12',
    category: 'Online Purchase',
    merchantOrRecipient: 'Digital Card Verification Auth',
    location: {
      city: 'Frankfurt',
      country: 'Germany',
      ip: '85.214.132.88',
      flag: '🇩🇪'
    },
    device: {
      type: 'Desktop',
      os: 'Windows 11',
      browser: 'Firefox 128',
      fingerprint: 'fp-unverified-ff-ger',
      isTrusted: false
    },
    velocityCount: 8,
    riskScore: 74,
    status: 'FLAGGED',
    anomalyReasons: [
      'Card testing signature detected: $1.00 authorization probe from foreign IP',
      'Unusual micro-transaction velocity across 8 rapid requests',
      'Cardholder typical billing geo is North America'
    ],
    isFraud: true,
    riskBreakdown: {
      amountRisk: 40,
      velocityRisk: 88,
      geoRisk: 72,
      merchantRisk: 80,
      deviceRisk: 75,
      behavioralRisk: 85
    }
  },
  {
    id: 'TX-90240',
    userId: 'USR-8821',
    userName: 'Alexander Wright',
    accountNumber: '**** **** 4829',
    amount: 1250.00,
    currency: 'USD',
    timestamp: '2026-10-10 09:12:00',
    category: 'Utilities & Bills',
    merchantOrRecipient: 'ConEdison Electric & Gas',
    location: {
      city: 'New York',
      country: 'United States',
      ip: '68.192.12.84',
      flag: '🇺🇸'
    },
    device: {
      type: 'Desktop',
      os: 'macOS Sequoia',
      browser: 'Safari 18',
      fingerprint: 'fp-alex-home-mac',
      isTrusted: true
    },
    velocityCount: 1,
    riskScore: 15,
    status: 'APPROVED',
    anomalyReasons: [],
    isFraud: false,
    riskBreakdown: {
      amountRisk: 18,
      velocityRisk: 4,
      geoRisk: 2,
      merchantRisk: 5,
      deviceRisk: 2,
      behavioralRisk: 8
    }
  }
];

export const initialAlerts: FraudAlert[] = [
  {
    id: 'ALT-1092',
    transactionId: 'TX-90412',
    userId: 'USR-8821',
    userName: 'Alexander Wright',
    timestamp: '2026-10-10 22:42:15',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    title: 'High-Velocity Out-of-Country Crypto Transfer Blocked',
    description: 'A transaction of $8,450.00 to BitVault Escrow Global Inc. in Lagos, Nigeria was blocked by AI Anomaly Detection.',
    riskScore: 94,
    triggers: [
      'Impossible travel velocity: 7,400km jump within 35 minutes',
      'Exceeds $5,000 threshold ($8,450.00)',
      'Tor exit-node IP detected'
    ]
  },
  {
    id: 'ALT-1091',
    transactionId: 'TX-90398',
    userId: 'USR-8821',
    userName: 'Alexander Wright',
    timestamp: '2026-10-10 21:18:40',
    severity: 'HIGH',
    status: 'ACTIVE',
    title: 'Suspicious Foreign P2P Wire Transfer Flagged',
    description: 'An unverified Android device initiated a $3,200.00 wire transfer to Minsk, Belarus requiring step-up identity verification.',
    riskScore: 78,
    triggers: [
      'New device fingerprint',
      'Foreign wire route',
      'Exceeds $1,500 2FA threshold'
    ]
  },
  {
    id: 'ALT-1088',
    transactionId: 'TX-90355',
    userId: 'USR-3392',
    userName: 'Marcus Sterling',
    timestamp: '2026-10-10 18:22:04',
    severity: 'HIGH',
    status: 'ACTIVE',
    title: 'Repeated ATM Cash Pull Near Daily Maximum Limit',
    description: 'Transaction of $4,950.00 at Standalone Casino ATM #401 flagged following 4 rapid balance inquiries.',
    riskScore: 82,
    triggers: [
      'Casino POS terminal zone',
      'Rapid burst inquiries',
      'Amount near $5,000 ceiling'
    ]
  },
  {
    id: 'ALT-1084',
    transactionId: 'TX-90299',
    userId: 'USR-7714',
    userName: 'Sarah Jenkins',
    timestamp: '2026-10-10 14:05:30',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    title: 'Automated Bot Escrow Wire Exceeding System Limit',
    description: 'Headless browser automated request of $12,000.00 to Cayman Islands escrow was blocked automatically.',
    riskScore: 98,
    triggers: [
      'Headless browser bot fingerprint',
      'Exceeds $5,000 threshold ($12,000.00)',
      'Restricted offshore routing'
    ]
  },
  {
    id: 'ALT-1079',
    transactionId: 'TX-90264',
    userId: 'USR-8821',
    userName: 'Alexander Wright',
    timestamp: '2026-10-10 11:58:12',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    title: 'Micro-Transaction Probe (Card Testing Pattern)',
    description: 'Foreign IP probed card validity with a $1.00 transaction amidst 8 rapid attempts in Frankfurt.',
    riskScore: 74,
    triggers: [
      'Card testing micro-charge signature',
      'Velocity burst (8 requests)',
      'Geo drift from primary address'
    ]
  }
];

export const initialFeedbacks: ModelFeedback[] = [
  {
    id: 'FB-401',
    caseId: 'CASE-9021',
    transactionId: 'TX-88401',
    timestamp: '2026-10-09 11:20:15',
    originalRiskScore: 76,
    adminVerdict: 'FALSE_POSITIVE',
    notes: 'Legitimate business traveler purchasing flight ticket from authorized corporate VPN.',
    retrainedInVersion: 'v2.4.1'
  },
  {
    id: 'FB-402',
    caseId: 'CASE-9023',
    transactionId: 'TX-88409',
    timestamp: '2026-10-09 13:45:00',
    originalRiskScore: 91,
    adminVerdict: 'CONFIRMED_FRAUD',
    notes: 'Confirmed account takeover via compromised session cookie. Cardholder refunded.',
    retrainedInVersion: 'v2.4.1'
  },
  {
    id: 'FB-403',
    caseId: 'CASE-9031',
    transactionId: 'TX-89102',
    timestamp: '2026-10-10 08:15:30',
    originalRiskScore: 68,
    adminVerdict: 'CONFIRMED_FRAUD',
    notes: 'Mule account deposit funneling stolen credit card batches. Blocked permanently.',
    retrainedInVersion: undefined
  }
];
