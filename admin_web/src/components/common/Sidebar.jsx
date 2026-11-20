import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Layers,
  FileText,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Package,
  TrendingUp,
  Clock,
  Sparkles,
  Truck,
  Receipt,
  DollarSign,
  Wallet,
  CreditCard,
  Star,
  Brain,
  History,
  Scale
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

// Admin Navigation Items (Clean governance menu)
const ADMIN_NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/supplier-approvals', label: 'Supplier Approvals', icon: UserCheck, badge: '7', badgeType: 'alert' },
  { path: '/admin/staff', label: 'Staff Management', icon: ShieldCheck },
  { path: '/admin/flower-categories', label: 'Flower Categories', icon: Layers },
  { path: '/admin/reports', label: 'Reports', icon: FileText }
];

// Business Officer Navigation Items (Directly mapped to project scope & database tables)
const OFFICER_NAV_ITEMS = [
  { path: '/officer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/officer/catalogue', label: 'Flower Catalogue', icon: Flower2 },
  { path: '/officer/suppliers', label: 'Suppliers', icon: Users },
  { path: '/officer/inventory', label: 'Inventory', icon: Package },
  { path: '/officer/orders', label: 'Orders', icon: TrendingUp },
  { path: '/officer/deliveries', label: 'Deliveries', icon: Truck },
  { path: '/officer/invoices', label: 'Invoices', icon: Receipt },
  { path: '/officer/forecasting', label: 'Demand Forecasting', icon: Brain, badge: 'ML' },
  { path: '/officer/reports', label: 'Reports', icon: FileText }
];

export default function Sidebar({ isMobileOpen = false, onCloseMobile }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = isAdmin ? ADMIN_NAV_ITEMS : OFFICER_NAV_ITEMS;

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <aside className={`royal-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <NavLink
          to={isAdmin ? '/admin/dashboard' : '/officer/dashboard'}
          className="sidebar-brand"
        >
          <img
            src="/logo.png"
            alt="Petalio Blossom"
            className="sidebar-logo-img"
            onError={(e) => {
              // Fallback to floral icon if image fails
              e.currentTarget.style.display = 'none';
            }}
          />
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Petalio Blossom</span>
              <span className="sidebar-brand-tagline">
                {isAdmin ? 'System Governance' : 'Floriculture Farm Ops'}
              </span>
            </div>
          )}
        </NavLink>

        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {!collapsed && (
          <span className="sidebar-section-title">
            {isAdmin ? 'Administration Modules' : 'Operations & Logistics'}
          </span>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.endsWith('/dashboard')}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="sidebar-icon" />
              {!collapsed && (
                <>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`sidebar-badge ${item.badgeType || ''}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer with Logout */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-link"
          style={{ color: 'rgba(255, 255, 255, 0.75)' }}
          onClick={() => setShowLogoutConfirm(true)}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="sidebar-icon" style={{ color: 'var(--color-dusty-rose)' }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="desktop-sidebar-wrap" style={{ display: 'flex' }}>
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <>
          <div className="sidebar-overlay" onClick={onCloseMobile} />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 55,
              display: 'flex'
            }}
          >
            {sidebarContent}
          </div>
        </>
      )}

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Sign Out"
        message="Are you sure you want to end your administrative session?"
        confirmText="Log Out"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

