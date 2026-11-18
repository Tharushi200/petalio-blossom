# Petalio Blossom - Mobile & Web Floriculture Farm Management System

Welcome to the **Petalio Blossom** project directory! This repository contains the complete foundation for database setup, Machine Learning demand forecasting, backend services, and front-end mobile/web applications.

---

## 🚀 Implementation Steps Overview (Lecturer's Guidelines)

1. **Step 1: Database Setup** (`/database/schema.sql`)
   - Complete MySQL relational database schema generated based on the ER diagram and Project Proposal.
   - Includes 17 tables supporting User Auth, Flower Catalogue, Inventory, Customer Orders, Supplier Capacity, Deliveries, Invoices, Payments, Reviews, Notifications, Expenses, and ML Demand Forecasts.

2. **Step 2: Machine Learning Demand Forecasting Model** (`/ml_service`)
   - **Historical Sales Dataset** (`/ml_service/data/flower_sales_historical.csv`): Real-world historical order records collected from floriculture flower vendor logs in Sri Lanka (spanning normal days, New Year, Mother's Day, and Wedding Seasons).
   - **ML Model Trainer** (`train_model.py`): Trains a `RandomForestRegressor` model to forecast flower demand based on flower types, unit prices, date features, and seasonal events.
   - **Prediction REST API** (`app.py`): Flask server delivering short-term and seasonal demand predictions via REST endpoints for backend and mobile apps.

3. **Step 3: Backend REST API Service** (Node.js / Express or Spring Boot)
   - Handles business logic, role-based security (Admin, Business Officer, Customer, Supplier), order matching, inventory updates, and integrates with the ML API.

4. **Step 4: Frontend Development**
   - **Web Dashboard**: React (for Admin & Business Officer).
   - **Mobile Applications**: Android Java / React Native (for Customers & Suppliers).

---

## 🛠️ How to Run the ML Demand Forecasting Service

### 1. Install Dependencies
```bash
cd ml_service
pip install -r requirements.txt
```

### 2. Train ML Model
```bash
py train_model.py
```
*(Trains model on `ml_service/data/flower_sales_historical.csv` and saves to `ml_service/models/demand_forecasting_model.pkl`)*

### 3. Start the Prediction API Server
```bash
py app.py
```
*(Runs on `http://127.0.0.1:5000`)*

---

## 📡 Sample Prediction API Request

### Predict Demand for Flower & Date:
- **URL**: `POST http://127.0.0.1:5000/api/predict`
- **Body**:
  ```json
  {
    "flower_type": "Sea Lavenders",
    "season_event": "Wedding Season",
    "price_per_unit": 980,
    "date": "2026-06-15"
  }
  ```

---

## 📁 Directory Structure
```
Petalio Blossom/
│
├── database/
│   └── schema.sql              # Full relational SQL schema
│
├── ml_service/
│   ├── data/
│   │   └── flower_sales_historical.csv # Historical shop sales dataset
│   ├── models/                 # Saved ML pickle models & encoders
│   ├── train_model.py          # Model training & evaluation script
│   ├── app.py                  # Flask prediction REST API
│   └── requirements.txt        # Python package dependencies
│
└── README.md                   # Project roadmap & guidelines
```
