import React from 'react';
import { Menu, Search, Flower2, Shield, Briefcase } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import UserProfileDropdown from './UserProfileDropdown';
import { useAuth } from '../../context/AuthContext';

export default function TopNavbar({ onToggleMobileSidebar }) {
  const { user, isAdmin } = useAuth();

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        {onToggleMobileSidebar && (
          <button
            type="button"
            className="sidebar-toggle-btn"
            style={{ color: 'var(--color-deep-plum)' }}
            onClick={onToggleMobileSidebar}
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
        )}

        <div className="navbar-search-box" style={{ width: '360px' }}>
          <Search size={16} style={{ color: 'var(--pb-text-muted)' }} />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search orders, flowers, suppliers..."
          />
          <span className="search-shortcut-badge">⌘K</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Environment / Actor indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--pb-radius-full)',
            background: 'var(--pb-tint)',
            color: 'var(--pb-rose)',
            fontSize: '0.76rem',
            fontWeight: 600
          }}
        >
          {isAdmin ? <Shield size={14} /> : <Briefcase size={14} />}
          <span>{isAdmin ? 'System Admin' : 'Business Officer'}</span>
        </div>

        <NotificationDropdown />

        <UserProfileDropdown />
      </div>
    </header>
  );
}

