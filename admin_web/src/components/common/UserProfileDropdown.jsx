import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Briefcase,
  Settings,
  LogOut,
  ChevronDown,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

export default function UserProfileDropdown() {
  const { user, logout, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const handleSwitchRole = (newRole) => {
    loginAsRole(newRole);
    setIsOpen(false);
    if (newRole === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/officer/dashboard');
    }
  };

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <div
          className="user-profile-trigger"
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
        >
          <div className="user-avatar">{user.avatar || (isAdmin ? 'AD' : 'BO')}</div>
          <div className="user-info-text">
            <span className="user-name">{user.name}</span>
            <span className="user-role-badge">
              {isAdmin ? 'System Admin' : 'Business Officer'}
            </span>
          </div>
          <ChevronDown
            size={14}
            style={{
              color: 'var(--color-text-muted)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            <div style={{ padding: '0.65rem 0.85rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-deep-plum)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                {user.email}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                {user.department}
              </div>
            </div>

            <div className="dropdown-divider" />

            {/* Quick Demo Role Switcher */}
            <div style={{ padding: '0.4rem 0.85rem' }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-dusty-rose)',
                  letterSpacing: '0.06em',
                  marginBottom: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Sparkles size={11} />
                <span>Switch Demo Actor</span>
              </div>

              {isAdmin ? (
                <button
                  type="button"
                  className="dropdown-item"
                  style={{
                    backgroundColor: 'var(--color-lavender-pink)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    color: 'var(--color-primary)'
                  }}
                  onClick={() => handleSwitchRole('BUSINESS_OFFICER')}
                >
                  <Briefcase size={15} />
                  <span>Switch to Business Officer</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="dropdown-item"
                  style={{
                    backgroundColor: 'var(--color-lavender-pink)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    color: 'var(--color-primary)'
                  }}
                  onClick={() => handleSwitchRole('ADMIN')}
                >
                  <Shield size={15} />
                  <span>Switch to System Admin</span>
                </button>
              )}
            </div>

            <div className="dropdown-divider" />

            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setIsOpen(false);
                navigate(isAdmin ? '/admin/settings' : '/officer/settings');
              }}
            >
              <Settings size={16} />
              <span>System Settings</span>
            </button>

            <button
              type="button"
              className="dropdown-item danger"
              onClick={() => {
                setIsOpen(false);
                setShowLogoutConfirm(true);
              }}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out of Petalio Blossom"
        message="Are you sure you want to end your current session? You will need to sign in again to access the management portal."
        confirmText="Log Out"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

