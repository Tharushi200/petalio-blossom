# 🌸 Petalio Blossom — Floriculture Farm, Order & Inventory Management System

> **Final Year Project — Higher National Diploma in Software Engineering (HNDSE)**  
> **Developed by:** Tharushi (Web Management Portal)  
> **Repository:** [https://github.com/Tharushi200/petalio-blossom](https://github.com/Tharushi200/petalio-blossom)

---

## 📌 1. Project Overview

**Petalio Blossom** is an enterprise-grade cut-flower farm and supply chain management system engineered for Sri Lanka's commercial floriculture industry. It bridges highland flower growers (Nuwara Eliya, Welimada, Badulla) with wholesale cut-flower buyers (luxury hotels, banquet events, boutique florists), backed by real-time warehouse inventory, automated supplier matching, and a Machine Learning seasonal demand forecasting engine.

---

## 📦 Modules

| Module | Status | Description |
|---|---|---|
| 🏠 **Dashboard** | ✅ Done | Executive KPIs, order distribution charts, live operations alerts |
| 🌸 **Flower Catalogue** | ✅ Done | 19 commercial cut-flower varieties, multi-color interactive switcher & pricing |
| 📦 **Inventory** | ✅ Done | Warehouse stock tracking, color-wise stock management & reorder alerts |
| 🛍️ **Orders** | ✅ Done | Wholesale customer order matching, status tracking & confirmation |
| 🚚 **Deliveries** | ✅ Done | Order dispatch scheduling, officer allocation & fulfillment tracking |
| 🧾 **Invoices & Payments** | ✅ Done | Commercial invoice generation (PDF export) & payment settlement |
| 👥 **Supplier Approvals** | ✅ Done | Highland grower onboarding, capacity inspection & verification |
| 🛡️ **User & Staff Management** | ✅ Done | Role-based user accounts (Admin/Officer/Customer/Supplier) & staff roster |
| 📊 **Reports** | ✅ Done | Instant executive PDF & CSV export for management audits |
| 🤖 **Demand Forecasting** | ✅ Done | Machine Learning Random Forest model predicting seasonal flower demand |

---

## 👥 2. User Roles & System Architecture

The ecosystem separates operational management (Web) from external field interactions (Mobile):

```
                       ┌───────────────────────────────────────────────┐
                       │               MySQL Database                  │
                       │           (petalio_blossom schema)            │
                       └───────────────────────┬───────────────────────┘
                                               │
                               ┌───────────────┴───────────────┐
                               │     Node.js / Express API     │
                               │        (Port: 5001)           │
                               └───┬───────────────────────┬───┘
                                   │                       │
                ┌──────────────────┴─────────┐   ┌─────────┴──────────────────┐
                │       Web Application      │   │     Mobile Applications    │
                │     (React 19 + Vite)      │   │   (Android / Field Users)  │
                └──────────────┬─────────────┘   └─────────┬──────────────────┘
                               │                           │
                 ┌─────────────┴─────────────┐   ┌─────────┴──────────────────┐
                 │ • System Administrator    │   │ • Wholesale Customers      │
                 │ • Business Officer        │   │ • Highland Farm Suppliers  │
                 └───────────────────────────┘   └────────────────────────────┘
```

### 🖥️ Web Portal Users (Admin & Operations)
* **System Administrator:**
  * System User & Staff Governance
  * Highland Supplier Onboarding & Farm Verification Approvals
  * Flower Category Management
  * System-wide Analytics & Audit Reports
* **Business Officer:**
  * Interactive Flower Catalogue (Multi-color visual switcher)
  * Commercial Wholesale Order Lifecycle Management
  * Real-time Warehouse Stock & Low-Stock Alerts
  * Delivery Dispatch & Logistics Tracking
  * Automated Executive PDF & CSV Report Export
  * Supplier Procurement Orders

### 📱 Mobile App Users (Field & External Clients)
* **Wholesale Customers (Hotels, Florists, Banquet Planners):**
  * Browse flower varieties, real-time prices & availability
  * Place bulk cut-flower orders & track delivery status
  * Access digital invoices & payment receipts
* **Farm Suppliers (Highland Flower Growers):**
  * Register farm capacity (monthly stems)
  * Accept procurement purchase orders from Petalio Blossom
  * Track supply delivery schedules & payment disbursements

---

## 💻 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend (Web)** | React 19, Vite, React Router 7, Recharts, Lucide Icons, jsPDF, CSS3 (Royal Orchid Theme) |
| **Backend API** | Node.js, Express, Sequelize ORM, JWT Authentication, Helmet, CORS |
| **Database** | MySQL 8.0 / MariaDB (Strict Relational Constraints) |
| **Machine Learning** | Python 3, Flask, Scikit-Learn (`RandomForestRegressor`), Pandas, NumPy |
| **Version Control** | Git, GitHub |

---

## 📂 4. Project Directory Structure

```
Petalio Blossom/
├── admin_web/                  # React 19 + Vite Frontend Management Portal
│   ├── public/                 # Static assets & flower imagery
│   ├── src/
│   │   ├── api/                # Backend API client integration
│   │   ├── components/         # Reusable UI components (Navbar, Sidebar, Tables, Cards)
│   │   ├── context/            # AuthContext (Role-based session governance)
│   │   ├── data/               # Project datasets & mock data
│   │   └── screens/
│   │       ├── admin/          # Admin screens (Users, Approvals, Staff, Categories)
│   │       └── officer/        # Officer screens (Dashboard, Catalogue, Inventory, Orders, Deliveries)
│   └── package.json
│
├── backend/                    # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/             # Database connection & Sequelize configuration
│   │   ├── controllers/        # Business logic controllers
│   │   ├── middleware/         # Auth JWT verification & role validation
│   │   ├── models/             # Sequelize ORM models
│   │   └── routes/             # REST API endpoint definitions
│   ├── server.js               # Express entry point
│   └── package.json
│
├── database/                   # Database Schemas & Migrations
│   └── schema.sql              # Clean, verified 18-table MySQL relational schema
│
├── ml_service/                 # Demand Forecasting ML Engine
│   ├── data/
│   │   └── flower_sales_historical.csv  # Historical vendor sales dataset (Sri Lanka)
│   ├── models/                 # Serialized model (.pkl) & label encoders
│   ├── train_model.py          # Random Forest Regressor training script
│   ├── app.py                  # Flask prediction microservice
│   └── requirements.txt
│
└── README.md                   # System documentation & execution guide
```

---

## 🚀 5. How to Setup & Run the Application

### 📋 Prerequisites
* **Node.js** (v18.x or v20.x)
* **MySQL / XAMPP**
* **Python** (v3.9 or higher)

---

### Step 1: Database Setup
1. Open **XAMPP Control Panel** and start **MySQL** (and Apache).
2. Open **phpMyAdmin** (`http://localhost/phpmyadmin`) or MySQL Workbench.
3. Import or execute the schema script:
   ```bash
   database/schema.sql
   ```
   *(This initializes the `petalio_blossom` database with 18 relational tables, foreign key constraints, and default seed data).*

---

### Step 2: Run the Backend API
1. Open a terminal and navigate to the backend directory:
   ```powershell
   cd "backend"
   npm install
   ```
2. Start the backend server:
   ```powershell
   npm run dev
   ```
   *API will run on **`http://localhost:5001`***  
   *Health Check endpoint: **`http://localhost:5001/api/health`***

---

### Step 3: Run the Web Application (Frontend)
1. Open a new terminal tab and navigate to `admin_web`:
   ```powershell
   cd "admin_web"
   npm install
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

### Step 4: Run the Machine Learning Microservice *(Optional)*
1. Open a terminal tab and navigate to `ml_service`:
   ```powershell
   cd "ml_service"
   pip install -r requirements.txt
   ```
2. Start the Flask prediction server:
   ```powershell
   python app.py
   ```
   *Prediction API will run on **`http://127.0.0.1:5000`***
