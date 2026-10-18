# 🚀 BizConnect - Role-Based Business Marketplace Platform

**BizConnect** is a full-stack, enterprise-grade business marketplace platform connecting **Entrepreneurs/Users**, **Verified Vendors**, and **Platform Administrators**. It facilitates business idea exploration, vendor discovery, service inquiries, quotations, and job recruitment.

---

## 📑 Table of Contents

- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Database Configuration](#-database-configuration)
- [How to Run the Application](#-how-to-run-the-application)
  - [Option A: One-Click Startup (Windows)](#option-a-one-click-startup-windows)
  - [Option B: Manual Terminal Startup](#option-b-manual-terminal-startup)
- [Default Demo Credentials](#-default-demo-credentials)
- [Role-Based Feature Matrix](#-role-based-feature-matrix)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🛠 Architecture & Tech Stack

### Backend
- **Framework:** Spring Boot 3.3.3 (Java 21+)
- **Security:** Spring Security 6 with JWT (JSON Web Tokens via `jjwt 0.12.5`)
- **Persistence:** Spring Data JPA / Hibernate (ORM)
- **Database:** MySQL 8.0+ (`bizconnect_db`)
- **Build Tool:** Apache Maven 3.9+
- **Utilities:** Project Lombok, Jakarta Validation

### Frontend
- **Framework:** React 18 with Vite 5
- **Routing:** React Router DOM v6 (role-based protected routes)
- **HTTP Client:** Axios (automatic JWT token interceptors & session handling)
- **Icons:** Lucide React
- **Styling:** Custom modern responsive design system (Vanilla CSS with CSS Variables)

---

## 📋 Prerequisites

Before running the application, ensure the following are installed on your machine:

| Requirement | Recommended Version | Verification Command |
| :--- | :--- | :--- |
| **Java JDK** | 21 or higher | `java -version` |
| **Apache Maven** | 3.8+ | `mvn -version` |
| **Node.js** | 18+ or 20+ | `node -v` |
| **npm** | 9+ or 10+ | `npm -v` |
| **MySQL Server** | 8.0+ | Check service status (`Get-Service MYSQL80` or MySQL Workbench) |

---

## 📁 Project Structure

```text
buss_connect/
├── backend/                         # Spring Boot Backend
│   ├── pom.xml                      # Maven configuration & dependencies
│   └── src/
│       ├── main/
│       │   ├── java/com/bizconnect/
│       │   │   ├── config/          # Security, Web & DataSeeder config
│       │   │   ├── controller/      # REST API controllers (Auth, Admin, Vendor, User, etc.)
│       │   │   ├── dto/             # Data Transfer Objects
│       │   │   ├── entity/          # JPA database entities
│       │   │   ├── repository/      # Spring Data JPA repositories
│       │   │   ├── security/        # JWT filter, provider & Auth services
│       │   │   └── service/         # Business logic layer
│       │   └── resources/
│       │       ├── application.properties  # Server port, DB URL & credentials
│       │       └── schema.sql       # Optional full DDL schema reference
│       └── test/                    # Unit and integration tests
│
├── frontend/                        # React + Vite Frontend
│   ├── package.json                 # Node dependencies and scripts
│   ├── vite.config.js               # Vite config with /api proxy to port 8080
│   ├── index.html                   # HTML entry point
│   └── src/
│       ├── components/              # Shared UI components (Navbar, ProtectedRoute)
│       ├── context/                 # AuthContext (state & tokens)
│       ├── pages/
│       │   ├── Login.jsx            # Authentication page with demo quick-autofill
│       │   ├── admin/               # Admin dashboards, verification & ideas management
│       │   ├── vendor/              # Vendor services, inquiries, profile & jobs
│       │   └── user/                # User business idea explorer, inquiries & marketplace
│       └── services/                # Axios API client
│
├── run-all.bat                      # Optional: One-click launcher for Windows
├── start-backend.bat                # Optional: Start Backend only
├── start-frontend.bat               # Optional: Start Frontend only
└── README.md                        # Documentation
```

---

## 🗄 Database Configuration

The backend is configured in `backend/src/main/resources/application.properties`:

```properties
server.port=${PORT:8080}

spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/bizconnect_db?sslMode=REQUIRED&serverTimezone=UTC}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:root}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:your_password}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

> [!NOTE]
> - Database credentials should be provided via environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`) or a local `.env` file (copied from `.env.example`).
> - For Aiven MySQL, SSL connection is required (`sslMode=REQUIRED`).
> - On the first run against an empty database, the `DataSeeder` component automatically populates initial categories, sample verified vendors, and test accounts.

---

## 🚀 How to Run the Application

### Option A: One-Click Startup (Windows)

Double-click the provided batch file in the project root:

1. Double-click **`run-all.bat`** (or execute `.\run-all.bat` in terminal).
2. It will open two separate console windows:
   - One starting the **Spring Boot Backend** (`http://localhost:8080`)
   - One starting the **Vite Dev Server** (`http://localhost:5173`)
3. Open your browser and navigate to **`http://localhost:5173`**.

---

### Option B: Manual Terminal Startup

Follow these simple steps using two terminal tabs/windows:

#### 1️⃣ Step 1: Start the Backend (Spring Boot)

Open a terminal in the project root and run:

```powershell
# Navigate into backend directory
cd backend

# Build and start the Spring Boot application
mvn spring-boot:run
```

*Wait until you see:*
```text
Started BizConnectApplication in X.XXX seconds (process running for ...)
```
The backend API is now running on **`http://localhost:8080`**.

---

#### 2️⃣ Step 2: Start the Frontend (React + Vite)

Open a **second terminal** in the project root and run:

```powershell
# Navigate into frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start Vite development server
npm run dev
```

*You will see:*
```text
  VITE v5.4.6  ready in ~300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

#### 3️⃣ Step 3: Access the Web Application

Open your browser and visit:
👉 **[http://localhost:5173](http://localhost:5173)**

The frontend automatically proxies `/api` calls to the Spring Boot backend running on `http://localhost:8080`.

---

## 🔑 Default Demo Credentials

BizConnect comes pre-seeded with sample accounts for all 3 roles. You can either type them or click the **Quick Demo Autofill** buttons at the bottom of the Login page:

| Role | Username | Password | Purpose & Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@123` | System oversight, vendor verification, category & idea approvals |
| **Verified Vendor** | `sunpower_vendor` | `Vendor@123` | Service catalog management, job postings, handling client inquiries |
| **User / Entrepreneur** | `john_entrepreneur` | `User@123` | Explore business ideas, contact vendors, submit inquiries, apply for jobs |

> [!TIP]
> You can also register a brand new **User** or **Vendor** account directly through the registration API or platform forms.

---

## 🎯 Role-Based Feature Matrix

### 1. 🛡️ Administrator (`/admin`)
- **Dashboard Metrics:** Real-time counts of users, vendors, approved ideas, pending verifications, and inquiries.
- **Vendor Verification:** Review pending vendor registrations, view business documents, approve or reject with reasons.
- **Category Management:** Create, edit, and toggle business categories (Renewable Energy, F&B, IT Cloud, etc.).
- **Business Ideas:** Publish vetted turnkey business blueprints with investment brackets, estimated ROI, and risk levels.
- **Audit Logs:** Immutable chronological log of all administrative actions for compliance.

### 2. 🏪 Vendor (`/vendor`)
- **Profile Management:** Edit company details, contact information, and verification status badges.
- **Services & Products:** Publish commercial equipment or service packages (includes draft/pending status).
- **Inquiries Inbox:** Receive direct inquiries from entrepreneurs, formulate quotation responses, and provide timelines.
- **Recruitment / Jobs:** Post job openings with skill requirements, review incoming job applicant profiles.

### 3. 💡 User / Entrepreneur (`/dashboard`)
- **Ideas Explorer:** Filter curated business blueprints by industry category, investment range, and risk profile.
- **Verified Vendors Directory:** Browse legitimate, approved vendors linked to each business niche.
- **Inquiry Management:** Send tailored inquiries to vendors for machinery, supplies, or partnerships; monitor quotes in real-time.
- **Career & Jobs:** Explore openings posted by verified vendors and submit applications.

---

## 📡 API Endpoints Overview

| Area | HTTP Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| **Auth** | `POST` | `/api/auth/register` | Register new user or vendor | Public |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| **Health**| `GET` | `/api/health` | Health check endpoint | Public |
| **Marketplace** | `GET` | `/api/marketplace/ideas` | List all published business ideas | Public / Auth |
| **Marketplace** | `GET` | `/api/marketplace/vendors` | List verified vendors | Public / Auth |
| **Inquiries** | `POST` | `/api/inquiries` | Create new inquiry to vendor | USER |
| **Inquiries** | `GET` | `/api/inquiries/my` | View submitted inquiries | USER |
| **Vendor** | `GET` | `/api/vendor/inquiries` | List received inquiries | VENDOR |
| **Vendor** | `PUT` | `/api/vendor/inquiries/{id}/respond` | Respond with quote & notes | VENDOR |
| **Vendor** | `POST` | `/api/vendor/services` | Add product/service listing | VENDOR |
| **Vendor** | `POST` | `/api/vendor/jobs` | Post new job opening | VENDOR |
| **Admin** | `GET` | `/api/admin/metrics` | Retrieve platform statistics | ADMIN |
| **Admin** | `PUT` | `/api/admin/vendors/{id}/verify` | Approve or reject vendor | ADMIN |
| **Admin** | `POST` | `/api/admin/ideas` | Create new business blueprint | ADMIN |
| **Admin** | `GET` | `/api/admin/audit-logs` | Retrieve audit history | ADMIN |

---

## ❓ Troubleshooting & FAQs

### Q1: `Communications link failure` or `Connection refused: connect` to MySQL
- Make sure your MySQL Windows Service (`MYSQL80`) is running:
  ```powershell
  Get-Service MYSQL80
  # If stopped, start it:
  Start-Service MYSQL80
  ```
- Verify the MySQL password in `backend/src/main/resources/application.properties` matches your local root password.

### Q2: Port 8080 or Port 5173 is already in use
- **Check who is using port 8080:**
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess
  ```
- **Change backend port:** Update `server.port=8081` in `application.properties` and update the proxy target in `frontend/vite.config.js` to match.
- **Change frontend port:** Update `server.port` in `frontend/vite.config.js`.

### Q3: `401 Unauthorized` or token expired
- JWT tokens expire after 24 hours. Simply log out and log in again, or click one of the **Quick Demo Autofill** buttons on `/login`.

---

## 📄 License
This project is developed for educational and commercial enterprise showcase purposes. All rights reserved.
