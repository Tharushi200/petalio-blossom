import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import OfficerLayout from './layouts/OfficerLayout';

// Screens
import PublicLandingPage from './screens/public/PublicLandingPage';
import LoginPage from './screens/auth/LoginPage';
import ResetPasswordPage from './screens/auth/ResetPasswordPage';
import AdminDashboard from './screens/admin/AdminDashboard';
import UserManagement from './screens/admin/UserManagement';
import SupplierApprovals from './screens/admin/SupplierApprovals';
import StaffManagement from './screens/admin/StaffManagement';
import FlowerCategories from './screens/admin/FlowerCategories';
import AdminReports from './screens/admin/AdminReports';
import SystemSettings from './screens/admin/SystemSettings';
import OfficerDashboard from './screens/officer/OfficerDashboard';
import FlowerCatalogue from './screens/officer/FlowerCatalogue';
import Suppliers from './screens/officer/Suppliers';
import Inventory from './screens/officer/Inventory';
import Orders from './screens/officer/Orders';
import Deliveries from './screens/officer/Deliveries';
import Invoices from './screens/officer/Invoices';
import DemandForecasting from './screens/officer/DemandForecasting';
import Reports from './screens/officer/Reports';
import PlaceholderPage from './components/common/PlaceholderPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Public Landing Page */}
          <Route path="/" element={<PublicLandingPage />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="customers" element={<PlaceholderPage title="Customer Registry" description="Wholesale flower buyers registered through the Petalio Blossom mobile app." />} />
            <Route path="suppliers" element={<PlaceholderPage title="Suppliers" description="Highland floriculture growers from Nuwara Eliya, Welimada, Badulla, and Kandy." />} />
            <Route path="supplier-approvals" element={<SupplierApprovals />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="roles" element={<PlaceholderPage title="Roles & Permissions" description="Role-based access control for admin staff." />} />
            <Route path="flower-categories" element={<FlowerCategories />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="notifications" element={<PlaceholderPage title="System Notifications" description="Alerts for backups, authentication, and urgent farm advisories." />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* Business Officer Protected Routes */}
          <Route path="/officer" element={<OfficerLayout />}>
            <Route index element={<Navigate to="/officer/dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route
              path="catalogue"
              element={<FlowerCatalogue />}
            />
            <Route
              path="suppliers"
              element={<Suppliers />}
            />
            <Route
              path="supplier-capacity"
              element={
                <PlaceholderPage
                  title="Supplier Capacity"
                  description="Real-time harvest forecast curves for highland growers to match upcoming hotel event orders."
                />
              }
            />
            <Route
              path="inventory"
              element={<Inventory />}
            />
            <Route
              path="stock-history"
              element={
                <PlaceholderPage
                  title="Stock Movement History"
                  description="Ledger of stock received from growers, warehouse transfers, and dispatch allocations."
                />
              }
            />
            <Route
              path="orders"
              element={<Orders />}
            />
            <Route
              path="pending-orders"
              element={
                <PlaceholderPage
                  title="Pending Orders"
                  description="Orders awaiting flower allocation from warehouse inventory or farm procurement dispatch."
                />
              }
            />
            <Route
              path="supplier-matching"
              element={
                <PlaceholderPage
                  title="Supplier Matching Engine"
                  description="Intelligent algorithm matching wholesale floral requirements with available farm harvest capacities."
                />
              }
            />
            <Route
              path="deliveries"
              element={<Deliveries />}
            />
            <Route
              path="invoices"
              element={<Invoices />}
            />
            <Route
              path="sales"
              element={
                <PlaceholderPage
                  title="Sales Analytics"
                  description="Breakdown of flower sales by customer tier, variety performance, and peak festival cycles."
                />
              }
            />
            <Route
              path="expenses"
              element={
                <PlaceholderPage
                  title="Operational Expenses"
                  description="Warehouse storage, preservative floral food, logistics fuel, and packaging consumables."
                />
              }
            />
            <Route
              path="supplier-payments"
              element={
                <PlaceholderPage
                  title="Supplier Payments"
                  description="Grower disbursement settlements, grade adjustment deductions, and payment schedules."
                />
              }
            />
            <Route
              path="reviews"
              element={
                <PlaceholderPage
                  title="Customer Reviews & Feedback"
                  description="Flower freshness ratings and delivery punctuality reviews submitted from the mobile app."
                />
              }
            />
            <Route
              path="forecasting"
              element={<DemandForecasting />}
            />
            <Route
              path="reports"
              element={<Reports />}
            />
            <Route
              path="notifications"
              element={
                <PlaceholderPage
                  title="Officer Notifications"
                  description="Harvest batch alerts, stock low-level alarms, and logistics delivery exceptions."
                />
              }
            />
          </Route>

          {/* Catch-all Wildcard Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
