# AI-Powered Fraud Detection System (Java Enterprise Edition)

## 🫥 Project Introduction
The **AI-Powered Fraud Detection System** is an enterprise financial security and anomaly prevention platform built on **Java 21 and Spring Boot 3.2.x**, paired with a high-performance modern client console. Designed for retail banking, payment processors, and anti-fraud operations centers, the platform intercepts fraudulent card transactions, velocity bursts, and sanction violations in real time using multi-vector statistical and machine learning anomaly scoring.

Secured by isolated access portals and **RFC 6238 Time-based One-Time Password (Google Authenticator TOTP)** two-factor authentication, it delivers sub-15ms threat detection and granular audit accountability.

---

## 📝 Project Overview and Features

### ☕ 1. Java Spring Boot 3 REST Backend Architecture
* **Controller Layer:** Clean RESTful endpoints (`AuthController`, `TransactionController`, `AdminController`) handling payload validation and status codes.
* **Service Layer:** `FraudDetectionEngine.java` computes multi-vector anomaly scores across 6 dimensions (Amount Z-score deviation, Velocity frequency, Sanctions/Geo drift, Merchant category, Device fingerprint, and Behavioral ensemble).
* **Data Persistence Layer:** Spring Data JPA entities (`Transaction`, `FraudAlert`, `SystemConfig`) backed by embedded H2 for instant local development and MySQL for production.
* **Google Authenticator (RFC 6238):** Native Java HMAC-SHA1 TOTP verification engine with clock-skew drift tolerance.

### 🔐 2. Dual-Role Access & 2FA Gateway
* **Isolated Client vs Security Portals:** Strict segregation between Cardholder Financial Accounts and Tier-3 Security Operations.
* **Profile Auto-Detection:** Automatically maps credentials to verified cardholder profiles.
* **Google Authenticator (TOTP):** 30-second live rotating countdown timer and 6-digit verification code.

### 💳 3. User Dashboard (Client Banking Portal)
* **Real-Time Transaction Alerts:** Instant notifications with threat severity scores (Low, Medium, High, Critical).
* **One-Click Resolution:** Immediate cardholder actions to **Verify Transaction** or **Dispute & Freeze Card**.
* **Transaction Simulator:** Interactive sandbox to test payments against multi-vector ML anomaly scoring with sub-15ms inference.
* **Transaction Ledger:** Historical transaction trail with risk levels and payment outcomes.

### 🛡️ 4. Admin Dashboard (Security Operations Console)
* **Configuration Settings:** Sliders to adjust autonomous interception thresholds (Auto-Block ceiling, review floor, velocity limits) with real-time deployment confirmation banners.
* **Detection Reports & Analytics:** 24-hour volume vs anomaly timelines, merchant distribution, risk score density histograms, and suspicious case audit logs with CSV export.
* **Algorithm Management:** Multi-model benchmarking (Random Forest v4.2, Isolation Forest, XGBoost), live Confusion Matrix (TP, FP, TN, FN), and dynamic model retraining feedback loops.
* **Java Architecture & Database Hub:** Live JDBC query console (`com.mysql.cj.jdbc.Driver`), DDL schema viewer, and interactive Java Spring Boot source code browser.

---

## ⛏️ Tech Stack, APIs, and Other Resources

### Backend (Java Ecosystem)
* **Core Language:** Java 21 LTS
* **Framework:** Spring Boot 3.2.4
* **Security:** Spring Security 6.x (Stateless REST, CORS, RFC 6238 TOTP)
* **ORM & Persistence:** Spring Data JPA / Hibernate 6.x
* **Database:** Embedded H2 Database (In-Memory for Dev) / MySQL 8.x Connector
* **Validation:** Jakarta Bean Validation (Hibernate Validator)
* **Build Tool:** Apache Maven 3.9+ (`pom.xml`)
* **Testing:** JUnit 5 & Mockito

### Frontend & Visuals
* **Client Framework:** React 19 + TypeScript
* **Styling:** Tailwind CSS v4 (Aesthetic Light Theme)
* **Icons:** Lucide React
* **Charts:** Recharts
* **Build Tooling:** Vite & Node.js

### API Endpoints
| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Dual-portal authentication with Google Authenticator TOTP |
| `GET` | `/api/v1/auth/totp/sample` | Generates active rotating sample TOTP code |
| `POST` | `/api/v1/transactions/analyze` | Real-time payment ingestion and multi-vector ML anomaly scoring |
| `GET` | `/api/v1/transactions/user/{id}` | Fetches user transaction history and risk status |
| `POST` | `/api/v1/transactions/alerts/{id}/resolve` | Cardholder alert resolution (Verify / Freeze Card) |
| `GET` | `/api/v1/admin/config` | Retrieves active fraud rule thresholds |
| `POST` | `/api/v1/admin/config` | Saves updated risk thresholds and rule parameters |
| `GET` | `/api/v1/admin/metrics` | Retrieves JVM telemetry, active threads, and detection counts |

---

## 🧑‍💻 Getting Started: Setup and Running Instructions

### 1. Prerequisites
* **Java Development Kit (JDK):** Version 21 or higher
* **Apache Maven:** Version 3.9 or higher (or use `./mvnw`)
* **Node.js:** Version 20+ and npm (for frontend asset compilation)

### 2. Running as a Full Java Spring Boot Application
```bash
# 1. Clone the repository
git clone <repository-url>
cd <project-folder>

# 2. Build the entire full-stack project with Maven
# (Maven automatically compiles React assets via frontend-maven-plugin)
mvn clean install

# 3. Launch the Spring Boot application
mvn spring-boot:run
```
* **Application URL:** [http://localhost:8080](http://localhost:8080)
* **Embedded H2 Database Console:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)  
  * *JDBC URL:* `jdbc:h2:mem:frauddb` | *User:* `sa` | *Password:* `password`
* **Actuator Health Metrics:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

### 3. Running the Client Development Server Standalone
```bash
# Install frontend dependencies
npm install

# Start Vite dev server on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Java Unit Tests
```bash
# Run JUnit 5 test suite for Fraud Detection Engine & TOTP
mvn test
```

---

## 🤝 How to Contribute and Report Issues
1. **Fork the Repository:** Create a new feature branch (`git checkout -b feature/java-ml-enhancement`).
2. **Commit Changes:** Use conventional commit messages (`git commit -m 'feat(engine): add isolation forest tree depth tuning'`).
3. **Verify Tests:** Ensure all tests pass (`mvn test` and `npm run lint`).
4. **Submit Pull Request:** Open a PR describing changes, architectural rationale, and performance benchmarks.
5. **Report Issues:** Open an issue ticket with stack traces, sample JSON payloads, and reproduction steps.

---

## 🔥 Conclusion and License
The **AI-Powered Fraud Detection System** demonstrates a production-grade Java 21 and Spring Boot 3 enterprise application that bridges the gap between machine learning anomaly detection and critical financial operations. It delivers sub-second transaction safety for cardholders and high-precision security controls for financial risk analysts.

Released under the **Apache-2.0 License**.
