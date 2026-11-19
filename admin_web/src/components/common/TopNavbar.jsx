import React from 'react';
import { Shield, Briefcase, Calendar } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import UserProfileDropdown from './UserProfileDropdown';
import { useAuth } from '../../context/AuthContext';

export default function TopNavbar() {
  const { user, isAdmin } = useAuth();

  // Dynamic Today's Date formatted nicely (e.g. "Thursday, Nov 19, 2026")
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Extract first name for a friendly greeting
  const firstName = user?.name ? user.name.split(' ')[0] : (isAdmin ? 'Admin' : 'Officer');

  return (
    <header className="top-navbar" style={{ padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Sleek single-line balanced greeting */}
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--pb-plum)', letterSpacing: '-0.3px' }}>
            Welcome back, {firstName}!
          </span>
          <span style={{ fontSize: '1.2rem' }}>👋</span>
        </div>

        <span style={{ color: 'var(--pb-border)', fontSize: '1.1rem' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>
          <Calendar size={14} color="var(--pb-rose)" style={{ flexShrink: 0 }} />
          <span>{todayDate}</span>
        </div>
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Environment / Actor indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.7rem',
            borderRadius: 'var(--pb-radius-full)',
            background: 'var(--pb-tint)',
            color: 'var(--pb-rose)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
        >
          {isAdmin ? <Shield size={13} /> : <Briefcase size={13} />}
          <span>{isAdmin ? 'System Admin' : 'Business Officer'}</span>
        </div>

        <NotificationDropdown />

        <UserProfileDropdown />
      </div>
    </header>
  );
}
