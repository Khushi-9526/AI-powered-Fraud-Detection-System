# AI-powered Fraud Detection System

## 🫥 Project Introduction
The **AI-powered Fraud Detection System** is an intelligent financial monitoring platform that leverages machine learning anomaly detection to protect financial transactions from fraud in real time. It provides distinct role-based portals for banking clients and security risk officers with two-factor authentication.

---

## 📝 Project Overview and Features

### 🔐 Dual-Role Access & 2FA Gateway
- **Isolated User & Admin Login:** Separate portals where only the chosen role form is displayed.
- **Auto-Detection Profile:** Instantly resolves account holder tier and clearance levels as credentials are typed.
- **Google Authenticator (TOTP):** 2-step verification with a 30s rotating countdown timer and sample quick-fill (`492817`).

### 🛡️ Admin Dashboard
- **Configuration Settings:** Manage detection thresholds (risk ceilings, velocity limits, geo-drift tolerance) with instant deployment confirmation.
- **Detection Reports:** Graphical visual analytics (Category Bar Chart, Risk Density Histogram, and 24-hr Volume vs Anomaly Timeline), CSV exports, and case investigation verdicts.
- **Algorithm Management:** Review model metrics, Confusion Matrix (TP, FP, TN, FN), and retrain algorithms dynamically using feedback loops.

### 💳 User Dashboard
- **Transaction Alerts:** Real-time notifications for flagged or suspicious transactions with 1-click **Verify** or **Dispute & Freeze Card** actions.
- **Transaction Simulator:** Test realistic payments or edge cases (velocity bursts, crypto gateways, offshore transfers) with multi-vector anomaly scoring.
- **Ledger History:** Complete searchable transaction record with risk status indicators.

---

## ⛏️ Tech Stack, APIs, and Other Resources
- **Frontend Framework:** React 19 + TypeScript
- **Bundler & Tooling:** Vite, Node.js, TSX
- **Styling:** Tailwind CSS v4 (Aesthetic Light Theme)
- **Icons & UI:** Lucide React (`lucide-react`)
- **Security & Standards:** TOTP RFC 6238 (Google Authenticator simulation)

---

## 🧑💻 Getting Started: Setup and Running Instructions

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

### 3. Build & Type Check
```bash
# Type check and lint
npm run lint

# Build for production
npm run build
```

---

## 🤝 How to Contribute and Report Issues
1. **Fork the Repository:** Create your own branch (`git checkout -b feature/new-feature`).
2. **Commit Changes:** Use descriptive commit messages (`git commit -m 'Add new anomaly feature'`).
3. **Open a Pull Request:** Submit a PR with details of the changes made.
4. **Report Issues:** Open an issue ticket with reproduction steps, expected results, and screenshots or error logs.

---

## 🔥 Conclusion and License
The **AI-powered Fraud Detection System** bridges the gap between machine learning anomaly detection and practical financial operations, delivering secure banking for cardholders and high-fidelity controls for risk analysts.

Released under the **Apache-2.0 License**.
