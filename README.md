# AI-powered Fraud Detection System

## 🫥 Project Introduction
The **AI-powered Fraud Detection System** is an intelligent financial monitoring and threat mitigation platform. Powered by machine learning anomaly detection, it protects cardholders and banking infrastructure from fraudulent activities in real time. The platform features isolated user and administrator access portals secured by two-factor authentication.

---

## 📝 Project Overview and Features

### 🔐 Dual-Role Access & 2FA Gateway
* **Isolated Portals:** Dedicated, separate entry points for **Client Financial Accounts** and **Admin Security Operations**.
* **Profile Auto-Detection:** Automatically detects user tier and account metadata upon credential input.
* **Google Authenticator (TOTP):** 2-step verification using a 30-second live rotating countdown timer and test code verification.

### 💳 User Dashboard (Client Portal)
* **Real-Time Transaction Alerts:** Instant notifications for intercepted or suspicious transactions with threat severity scores.
* **One-Click Resolution:** Immediate cardholder actions to **Verify Transaction** or **Dispute & Freeze Card**.
* **Transaction Simulator:** Interactive sandbox to test payments against multi-vector ML anomaly scoring with sub-15ms inference.
* **Transaction Ledger:** Comprehensive history with real-time risk indicators and payment statuses.

### 🛡️ Admin Dashboard (Security Operations)
* **Configuration Settings:** Sliders to adjust autonomous interception thresholds (Auto-Block ceiling, manual review floor, velocity limits) with real-time deployment confirmation banners.
* **Detection Reports & Analytics:** 24-hour volume vs anomaly timelines, merchant category distribution, risk score density histograms, and suspicious case audit logs with CSV export.
* **Algorithm Management:** Multi-model benchmarking (Random Forest v4.2, Isolation Forest, XGBoost), live Confusion Matrix (TP, FP, TN, FN), and dynamic model retraining feedback loops.

---

## ⛏️ Tech Stack, APIs, and Other Resources
* **Frontend Framework:** React 19 + TypeScript
* **Styling & Design:** Tailwind CSS v4 (Aesthetic Light Theme)
* **Icons:** Lucide React (`lucide-react`)
* **Build Tooling:** Vite & Node.js
* **ML Scoring Engine:** Hybrid Random Forest + Isolation Forest Multi-Vector Scoring
* **Authentication Standards:** TOTP RFC 6238 (Google Authenticator simulation)

---

## 🧑‍💻 Getting Started: Setup and Running Instructions

### 1. Installation
```bash
git clone <repository-url>
cd <project-folder>
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Lint
```bash
# Type-check and lint
npm run lint

# Production build
npm run build
```

---

## 🤝 How to Contribute and Report Issues
1. **Fork the Repository:** Create your feature branch (`git checkout -b feature/new-anomaly-detector`).
2. **Commit Changes:** Use semantic commit messages (`git commit -m 'feat: enhance velocity detection'`).
3. **Open a Pull Request:** Submit a PR with a description of features and test coverage.
4. **Report Issues:** Open an issue ticket with detailed reproduction steps, logs, and screenshots.

---

## 🔥 Conclusion and License
The **AI-powered Fraud Detection System** bridges the gap between machine learning anomaly detection and practical financial operations, delivering secure banking for cardholders and high-fidelity controls for risk analysts.

Released under the **Apache-2.0 License**.
