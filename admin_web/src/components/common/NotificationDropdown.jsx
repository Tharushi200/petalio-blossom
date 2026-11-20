import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  Clock,
  AlertTriangle,
  Truck,
  Flower2,
  Users,
  ShieldCheck,
  DollarSign,
  X,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Role-Aware Notification Presets Aligned with Use Case & Database ────────
const OFFICER_NOTIFICATIONS_INITIAL = [
  {
    id: 'NOTIF-OFF-01',
    message: 'Low Stock Critical Warning',
    detail: 'Sunshine Gerbera fell to 45 stems (Reorder threshold: 50).',
    time: '25 mins ago',
    read: false,
    type: 'stock',
    link: '/officer/inventory'
  },
  {
    id: 'NOTIF-OFF-02',
    message: 'Delivery Dispatch Required',
    detail: 'Order #ORD-8839 for Shangri-La is ready for delivery scheduling.',
    time: '1 hour ago',
    read: false,
    type: 'logistics',
    link: '/officer/deliveries'
  },
  {
    id: 'NOTIF-OFF-03',
    message: 'Daily AI Demand Forecast Ready',
    detail: 'ML engine predicts +28% surge in red roses for upcoming weekend.',
    time: '3 hours ago',
    read: true,
    type: 'ml',
    link: '/officer/forecasting'
  },
  {
    id: 'NOTIF-OFF-04',
    message: 'Pending Invoice Settlement',
    detail: 'Commercial invoice #INV-4 for Order ORD-1004 (Rs. 96,000) is awaiting payment.',
    time: '5 hours ago',
    read: true,
    type: 'payment',
    link: '/officer/invoices'
  }
];

const ADMIN_NOTIFICATIONS_INITIAL = [
  {
    id: 'NOTIF-ADM-01',
    message: 'New Grower Verification Pending',
    detail: 'Bandarawela Orchid Blooms applied for commercial grower approval.',
    time: '15 mins ago',
    read: false,
    type: 'supplier',
    link: '/admin/supplier-approvals'
  },
  {
    id: 'NOTIF-ADM-02',
    message: 'Corporate Customer Registered',
    detail: 'Shangri-La Banquets completed mobile wholesale buyer registration.',
    time: '2 hours ago',
    read: false,
    type: 'user',
    link: '/admin/users'
  },
  {
    id: 'NOTIF-ADM-03',
    message: 'System Security & Backup Succeeded',
    detail: 'Nightly database backup and JWT authentication check completed with 0 errors.',
    time: '6 hours ago',
    read: true,
    type: 'security',
    link: '/admin/reports'
  }
];

export default function NotificationDropdown() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [notifications, setNotifications] = useState(
    isAdmin ? ADMIN_NOTIFICATIONS_INITIAL : OFFICER_NOTIFICATIONS_INITIAL
  );
  const dropdownRef = useRef(null);

  // Update initial list when switching roles
  useEffect(() => {
    setNotifications(isAdmin ? ADMIN_NOTIFICATIONS_INITIAL : OFFICER_NOTIFICATIONS_INITIAL);
  }, [isAdmin]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredList = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item) => {
    // 1. Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    // 2. Close dropdown
    setIsOpen(false);
    // 3. Navigate to relevant screen if link exists
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'stock':
        return <AlertTriangle size={15} color="#D97706" />;
      case 'logistics':
        return <Truck size={15} color="#2563EB" />;
      case 'ml':
        return <Sparkles size={15} color="#76518F" />;
      case 'payment':
        return <DollarSign size={15} color="#059669" />;
      case 'supplier':
        return <Users size={15} color="#76518F" />;
      case 'user':
        return <Users size={15} color="#2563EB" />;
      case 'security':
        return <ShieldCheck size={15} color="#059669" />;
      default:
        return <Flower2 size={15} color="#D98DA6" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* ── Bell Trigger Button with Active Count Badge ───────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        title="Notifications"
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: '1px solid var(--pb-border)',
          background: isOpen ? 'var(--pb-blush)' : 'var(--pb-surface)',
          color: isOpen ? 'var(--pb-rose)' : 'var(--pb-plum)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              background: '#E11D48',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--pb-surface)',
              boxShadow: '0 2px 4px rgba(225,29,72,0.3)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Notification Dropdown Box ─────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '380px',
            maxWidth: '92vw',
            background: 'var(--pb-surface)',
            border: '1.5px solid var(--pb-border)',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.14)',
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.9rem 1.1rem 0.65rem 1.1rem',
              background: 'var(--pb-blush)',
              borderBottom: '1px solid var(--pb-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--pb-plum)' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.74rem',
                      color: 'var(--pb-rose)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <CheckCheck size={14} />
                    Mark read
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    title="Clear all notifications"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.74rem',
                      color: 'var(--pb-text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: 0
                    }}
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: filter === 'ALL' ? '1.5px solid var(--pb-rose)' : '1px solid transparent',
                  background: filter === 'ALL' ? 'var(--pb-surface)' : 'transparent',
                  color: filter === 'ALL' ? 'var(--pb-rose)' : 'var(--pb-text-muted)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('UNREAD')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: filter === 'UNREAD' ? '1.5px solid var(--pb-rose)' : '1px solid transparent',
                  background: filter === 'UNREAD' ? 'var(--pb-surface)' : 'transparent',
                  color: filter === 'UNREAD' ? 'var(--pb-rose)' : 'var(--pb-text-muted)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div style={{ overflowY: 'auto', maxHeight: '360px' }}>
            {filteredList.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                <Check size={28} color="#15803D" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--pb-plum)' }}>
                  You're all caught up!
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', marginTop: '4px' }}>
                  No {filter === 'UNREAD' ? 'unread' : 'active'} notifications right now.
                </div>
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '0.85rem 1.1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    borderBottom: '1px solid var(--pb-border)',
                    backgroundColor: item.read ? 'transparent' : 'rgba(217,141,166,0.08)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--pb-blush)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = item.read
                      ? 'transparent'
                      : 'rgba(217,141,166,0.08)';
                  }}
                >
                  {/* Category Icon */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--pb-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      flexShrink: 0,
                      marginTop: '2px',
                      border: '1px solid var(--pb-border)'
                    }}
                  >
                    {getNotifIcon(item.type)}
                  </div>

                  {/* Notification Content */}
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: item.read ? 600 : 800,
                          color: 'var(--pb-plum)'
                        }}
                      >
                        {item.message}
                      </span>
                      {!item.read && (
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#E11D48',
                            flexShrink: 0
                          }}
                        />
                      )}
                    </div>

                    {item.detail && (
                      <p
                        style={{
                          fontSize: '0.77rem',
                          color: 'var(--pb-text-body)',
                          lineHeight: 1.35,
                          margin: '2px 0 4px 0'
                        }}
                      >
                        {item.detail}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                          color: 'var(--pb-text-muted)'
                        }}
                      >
                        <Clock size={11} />
                        {item.time}
                      </span>

                      {item.link && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--pb-rose)', fontWeight: 700 }}>
                          View details →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dismiss X button */}
                  <button
                    type="button"
                    onClick={(e) => handleDismiss(e, item.id)}
                    title="Dismiss"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--pb-text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.65rem',
              textAlign: 'center',
              borderTop: '1px solid var(--pb-border)',
              background: 'var(--pb-blush)',
              fontSize: '0.75rem',
              color: 'var(--pb-text-muted)',
              fontWeight: 600
            }}
          >
            Clicking a notification navigates directly to the task
          </div>
        </div>
      )}
    </div>
  );
}
