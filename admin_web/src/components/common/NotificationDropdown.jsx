import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Sparkles, Clock, AlertCircle, Truck, Flower2 } from 'lucide-react';
import { SYSTEM_NOTIFICATIONS } from '../../data/mockData';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(SYSTEM_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'stock':
        return <AlertCircle size={15} style={{ color: 'var(--color-warning)' }} />;
      case 'logistics':
        return <Truck size={15} style={{ color: 'var(--color-info)' }} />;
      case 'ml':
        return <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />;
      default:
        return <Flower2 size={15} style={{ color: 'var(--color-dusty-rose)' }} />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        className="icon-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="unread-dot" />}
      </button>

      {isOpen && (
        <div className="dropdown-menu dropdown-notifications">
          <div
            style={{
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-deep-plum)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: 'var(--color-lavender-pink)',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    padding: '0.05rem 0.45rem',
                    borderRadius: '10px'
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.76rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                <Check size={13} />
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No notifications
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    backgroundColor: item.read ? 'transparent' : 'var(--color-lavender-pink-subtle)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--pb-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    {getNotifIcon(item.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        marginBottom: '0.2rem'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: 'var(--color-deep-plum)'
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
                            background: 'var(--color-primary)',
                            flexShrink: 0
                          }}
                        />
                      )}
                    </div>
                    {item.detail && (
                      <p
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.35,
                          margin: 0
                        }}
                      >
                        {item.detail}
                      </p>
                    )}
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '0.35rem'
                      }}
                    >
                      <Clock size={11} />
                      {item.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              padding: '0.65rem',
              textAlign: 'center',
              borderTop: '1px solid var(--color-border-subtle)',
              background: 'var(--pb-blush)'
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-primary)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => setIsOpen(false)}
            >
              Close Notifications
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

