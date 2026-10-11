# AI-powered Fraud Detection System

An enterprise-grade, machine-learning-driven fraud anomaly detection and prevention platform designed to monitor financial transactions in real time, score multi-vector risks, trigger cardholder alerts, and enable risk officers to fine-tune algorithms and thresholds.

---

## 📌 Project Overview

- **Project Title:** AI-powered Fraud Detection System
- **Core Purpose:** Identify and prevent fraudulent activities in high-throughput financial transactions using machine learning anomaly detection algorithms and heuristic guardrails.
- **Key Users:**
  1. **Admin (Security & Risk Operations):** Configures detection thresholds, reviews graphical detection reports, investigates flagged cases, and retrains detection algorithms via feedback loops.
  2. **User (Banking Client):** Conducts financial transactions, receives instant alerts for suspicious activities, and verifies or disputes charges in real time.

---

## 🚀 Key Features

### 1. Dual-Portal Authentication & 2FA Gateway
- **Isolated Login Portals:** Separate login views for **User Banking Portal** and **Admin Security Portal**. When User login is active, the Admin card is hidden; when Admin is active, the User card is hidden.
- **Automatic Profile Detection:** As the user enters their account number or name (or selects from registered accounts), their account tier, clearance level, and verified status are automatically resolved.
- **Two-Factor Authentication (Google Authenticator / TOTP):** Secure Step-2 OTP verification with rotating 30-second countdown timer, input auto-focus, validation, and sample quick-fill for demo evaluations (`492817`).

### 2. Admin Dashboard & Compliance Console
- **System Configuration:**
  - **Inputs:** Detection thresholds (low/high risk boundaries, single transaction ceilings, velocity limits per 5 minutes, geo-drift tolerance, 2FA triggers, auto-block scores), feature weights, and restricted merchants/countries.
  - **Outputs:** Immediate confirmation banner of successful configuration deployment with version increment and audit timestamp.
  - **Functionality:** Hot-reloads threshold parameters across all transaction inspection gateways.
- **Detection Reports & Graphical Analytics:**
  - **Inputs:** Stream of detected fraud cases and anomalous transactions.
  - **Outputs:** Interactive graphical representations:
    - **Fraud Cases by Category:** Bar chart of anomalies across merchant sectors.
    - **Risk Score Density Histogram:** Distribution across Low (0–25), Guarded (26–50), Challenged (51–75), and Critical (76–100) scores.
    - **Transaction Volume vs Anomaly Timeline:** 24-hour stacked bar chart comparing normal velocity vs flagged fraud surges with hover tooltips.
    - **CSV Audit Export:** One-click export of filtered fraud reports.
  - **Functionality:** Case investigation modal to review triggers, attach investigator notes, and categorize verdicts (Confirmed Fraud vs. False Positive).
- **Algorithm Management & Retraining Loop:**
  - **Inputs:** Performance data, live transaction vectors, and compliance officer verdicts.
  - **Outputs:** Updated detection algorithms deployed to production with performance delta banners (+Accuracy, +Recall, F1 score) and complete Confusion Matrix (TP, FP, TN, FN).
  - **Functionality:** Hyperparameter fine-tuning (anomaly sensitivity, contamination rate, estimator count) and model retraining pipeline.

### 3. User Banking Portal & Fraud Shield
- **Transaction Alerts:**
  - Lists real-time notifications for suspicious, challenged, or blocked transactions.
  - Displays risk level tags (Critical, High, Medium), AI anomaly score (0–100), and specific trigger reasons (velocity burst, large offshore wire, anonymous proxy, etc.).
  - One-click cardholder resolution: **Verify as Legitimate** or **Dispute & Freeze Card**.
- **Financial Transaction Simulator:**
  - Submit simulated transactions across various categories, amounts, merchants, and international locations.
  - Test pre-configured risk scenarios: Normal Coffee, Rapid Velocity Burst, Offshore Crypto Gateway, and Large Escrow Wire.
  - Instant inspection output displaying multi-vector risk breakdown (amount, velocity, geolocation, merchant, device, behavioral).
- **My Transaction History:**
  - Searchable ledger of all personal transactions with status badges (`APPROVED`, `FLAGGED`, `BLOCKED`, `CHALLENGED`).

---

## 🛠️ Technology Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with an aesthetic fintech light theme (`#FFFFFF`, `#F8FAFC`, slate, teal, cyan, emerald, and rose accents)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** Functional React hooks with real-time bidirectional updates between User transactions, Admin analytics, and ML retraining feedback loops.

---

## 📂 Project Structure

```text
├── index.html                           # App entry HTML with SEO meta tags
├── metadata.json                        # App metadata and permissions
├── package.json                         # Project dependencies and npm scripts
├── tsconfig.json                        # TypeScript compiler configuration
├── vite.config.ts                       # Vite bundler configuration
└── src/
    ├── App.tsx                          # Root container, session routing, and global toast notifications
    ├── index.css                        # Tailwind CSS global styles
    ├── main.tsx                         # React application entry point
    ├── types/
    │   └── fraud.ts                     # TypeScript data models (Transaction, FraudAlert, SystemConfig, AlgorithmModel, ConfusionMatrix)
    ├── data/
    │   └── mockData.ts                  # Realistic banking transactions, initial model parameters, and baseline configs
    ├── services/
    │   └── fraudEngine.ts               # Multi-vector ML anomaly scoring engine, baseline profiles, and model retraining pipeline
    └── components/
        ├── Navbar.tsx                   # Top header with session badge, active engine version, and portal switch
        ├── auth/
        │   └── LoginPortal.tsx          # Dual-role login gateway with auto profile detection & Google Authenticator 2FA
        ├── admin/
        │   ├── AdminDashboard.tsx       # Admin tabs (Detection Reports, System Configuration, Algorithm Management)
        │   ├── SystemConfiguration.tsx  # Configuration settings form & deployment confirmation
        │   ├── DetectionReports.tsx     # Graphical fraud reports, CSV export & case investigation modal
        │   └── AlgorithmManagement.tsx  # ML model metrics, hyperparameter tuning & retrain pipeline
        ├── user/
        │   └── UserDashboard.tsx        # Cardholder alerts, transaction simulator & ledger history
        └── charts/
            └── FraudCharts.tsx          # Custom SVG/CSS charts (Category Bar Chart, Histogram, Stacked Timeline, Confusion Matrix)
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### Installation
1. Clone the repository or navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
To generate an optimized production build:
```bash
npm run build
```

### Type Checking & Linting
To check TypeScript types and validate the codebase:
```bash
npm run lint
```

---

## 🧪 Demo Credentials & Walkthrough

1. **User Banking Login:**
   - Select **User Banking Portal**.
   - Pick any registered account (e.g. *Alexander Wright*, *Elena Rostova*, or *Marcus Sterling*).
   - Click **Continue with Google Authenticator**.
   - Click **Fill Sample OTP (492817)** and submit.
   - Test by opening **Make Transaction (Simulator)** $\rightarrow$ choose **Offshore Crypto** $\rightarrow$ submit.
   - Notice the instant notification and new entry in **Transaction Alerts**.

2. **Admin Security Login:**
   - Switch portal to **Admin Security Portal**.
   - Select an officer (e.g. *Sarah Vance - Chief Risk Officer*).
   - Enter credentials and verify via Google Authenticator OTP.
   - View **Detection Reports** to see real-time charts updated with the suspicious transactions.
   - Investigate the case, assign a verdict, and open **Algorithm Management** to click **Refine & Retrain Algorithm with Feedback Loop**.

---

## 📄 License
This project is licensed under the Apache-2.0 License.
