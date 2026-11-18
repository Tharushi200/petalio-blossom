import React, { useState } from 'react';
import {
  Users,
  Activity,
  ShieldOff,
  Search,
  Download,
  UserPlus,
  Mail,
  Clock,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

const MOCK_USERS = [
  { id: 1, name: 'Anuki Perera',       role: 'Admin',            email: 'anuki@petalio.lk',    lastLogin: '2 min ago',   status: 'Active',    initials: 'AP', color: '#c0376b' },
  { id: 2, name: 'Kasun Silva',         role: 'Business Officer', email: 'kasun@petalio.lk',    lastLogin: '1 hr ago',    status: 'Active',    initials: 'KS', color: '#7c3aed' },
  { id: 3, name: 'Thilini Fernando',   role: 'Business Officer', email: 'thilini@petalio.lk',  lastLogin: '3 hrs ago',   status: 'Active',    initials: 'TF', color: '#0891b2' },
  { id: 4, name: 'Ruwan Jayawardena',  role: 'Supplier',         email: 'ruwan@hakgala.lk',    lastLogin: 'Yesterday',   status: 'Active',    initials: 'RJ', color: '#059669' },
  { id: 5, name: 'Nadeesha Wickrama',  role: 'Customer',         email: 'nadeesha@shangri.lk', lastLogin: '2 days ago',  status: 'Active',    initials: 'NW', color: '#d97706' },
  { id: 6, name: 'Pradeep Kumara',     role: 'Supplier',         email: 'pradeep@nueliya.lk',  lastLogin: '5 days ago',  status: 'Suspended', initials: 'PK', color: '#059669' },
  { id: 7, name: 'Sumudu Rathnayake', role: 'Customer',         email: 'sumudu@kingsbury.lk', lastLogin: '1 week ago',  status: 'Active',    initials: 'SR', color: '#d97706' },
  { id: 8, name: 'Buddhika Perera',    role: 'Business Officer', email: 'buddhika@petalio.lk', lastLogin: '2 weeks ago', status: 'Suspended', initials: 'BP', color: '#7c3aed' },
];

const ROLE_TABS = ['All', 'Admin', 'Business Officer', 'Customer', 'Supplier'];

const ROLE_BADGE_STYLES = {
  Admin: { background: 'rgba(192, 55, 107, 0.12)', color: '#c0376b', border: '1px solid rgba(192,55,107,0.25)' },
  'Business Officer': { background: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.25)' },
  Supplier: { background: 'rgba(5, 150, 105, 0.12)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' },
  Customer: { background: 'rgba(217, 119, 6, 0.12)', color: '#d97706', border: '1px solid rgba(217,119,6,0.25)' },
};

function KpiCard({ icon: Icon, label, value, iconBg, iconColor, valueColor }) {
  return (
    <div style={{
      background: 'var(--pb-surface)',
      border: '1px solid var(--pb-border)',
      borderRadius: 16,
      padding: '24px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      boxShadow: 'var(--pb-shadow)',
      flex: 1,
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={24} color={iconColor} strokeWidth={1.8} />
      </div>
      <div>
        <p style={{
          margin: 0,
          fontSize: 13,
          fontFamily: 'var(--pb-font-body)',
          color: '#888',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}>{label}</p>
        <p style={{
          margin: '4px 0 0',
          fontSize: 28,
          fontFamily: 'var(--pb-font-heading)',
          fontWeight: 700,
          color: valueColor || 'var(--pb-plum)',
          lineHeight: 1,
        }}>{value}</p>
      </div>
    </div>
  );
}

function UserCard({ user, onToggleStatus }) {
  const roleBadge = ROLE_BADGE_STYLES[user.role] || {};
  const isActive = user.status === 'Active';

  return (
    <div style={{
      background: 'var(--pb-surface)',
      border: '1px solid var(--pb-border)',
      borderRadius: 16,
      padding: '20px 22px',
      boxShadow: 'var(--pb-shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      transition: 'box-shadow 0.2s, transform 0.2s',
      opacity: isActive ? 1 : 0.75,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(192,55,107,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--pb-shadow)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row: avatar + name + role + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Avatar */}
        <div style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: user.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 2px 8px ${user.color}44`,
        }}>
          <span style={{
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--pb-font-heading)',
            letterSpacing: '0.03em',
          }}>{user.initials}</span>
        </div>

        {/* Name + role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--pb-font-body)',
            color: 'var(--pb-plum)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{user.name}</p>
          <span style={{
            display: 'inline-block',
            marginTop: 5,
            fontSize: 11.5,
            fontWeight: 600,
            fontFamily: 'var(--pb-font-body)',
            padding: '2px 10px',
            borderRadius: 20,
            letterSpacing: '0.03em',
            ...roleBadge,
          }}>{user.role}</span>
        </div>

        {/* Status badge */}
        <span style={{
          fontSize: 11.5,
          fontWeight: 600,
          fontFamily: 'var(--pb-font-body)',
          padding: '3px 10px',
          borderRadius: 20,
          background: isActive ? 'rgba(5,150,105,0.1)' : 'rgba(217,119,6,0.1)',
          color: isActive ? '#059669' : '#d97706',
          border: isActive ? '1px solid rgba(5,150,105,0.25)' : '1px solid rgba(217,119,6,0.25)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {user.status}
        </span>
      </div>

      {/* Meta info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Mail size={13} color="#aaa" strokeWidth={2} />
          <span style={{
            fontSize: 13,
            fontFamily: 'var(--pb-font-body)',
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{user.email}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Clock size={13} color="#aaa" strokeWidth={2} />
          <span style={{
            fontSize: 13,
            fontFamily: 'var(--pb-font-body)',
            color: '#666',
          }}>Last login: {user.lastLogin}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--pb-border)', margin: '0 -2px' }} />

      {/* Action button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onToggleStatus(user.id)}
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: 'var(--pb-font-body)',
            padding: '5px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            border: isActive
              ? '1.5px solid rgba(220,38,38,0.35)'
              : '1.5px solid rgba(5,150,105,0.35)',
            background: isActive
              ? 'rgba(220,38,38,0.05)'
              : 'rgba(5,150,105,0.05)',
            color: isActive ? '#dc2626' : '#059669',
            letterSpacing: '0.02em',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isActive
              ? 'rgba(220,38,38,0.1)'
              : 'rgba(5,150,105,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isActive
              ? 'rgba(220,38,38,0.05)'
              : 'rgba(5,150,105,0.05)';
          }}
        >
          {isActive ? 'Suspend' : 'Activate'}
        </button>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleStatus = (id) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
          : u
      )
    );
  };

  const filteredUsers = users.filter(u => {
    const matchRole = activeTab === 'All' || u.role === activeTab;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term);
    return matchRole && matchSearch;
  });

  const totalUsers = users.length;
  const activeToday = users.filter(u => ['2 min ago', '1 hr ago', '3 hrs ago'].includes(u.lastLogin)).length;
  const suspended = users.filter(u => u.status === 'Suspended').length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--pb-tint)',
      fontFamily: 'var(--pb-font-body)',
    }}>
      {/* Page Header */}
      <PageHeader
        title="User Management"
        subtitle="Everyone with access to Petalio Blossom"
        rightContent={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button variant="outline" icon={<Download size={15} strokeWidth={2} />}>
              Export
            </Button>
            <Button
              variant="primary"
              icon={<UserPlus size={15} strokeWidth={2} />}
              style={{ background: 'var(--pb-rose)', color: '#fff' }}
            >
              Add User
            </Button>
          </div>
        }
      />

      {/* Main content area */}
      <div style={{ padding: '32px 36px', maxWidth: 1300, margin: '0 auto' }}>

        {/* KPI Cards */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
          <KpiCard
            icon={Users}
            label="Total Users"
            value={totalUsers.toLocaleString()}
            iconBg="rgba(192,55,107,0.1)"
            iconColor="var(--pb-rose)"
            valueColor="var(--pb-plum)"
          />
          <KpiCard
            icon={Activity}
            label="Active Today"
            value={activeToday.toLocaleString()}
            iconBg="rgba(5,150,105,0.1)"
            iconColor="#059669"
            valueColor="#059669"
          />
          <KpiCard
            icon={ShieldOff}
            label="Suspended"
            value={suspended}
            iconBg="rgba(217,119,6,0.1)"
            iconColor="#d97706"
            valueColor="#d97706"
          />
        </div>

        {/* Filter Bar */}
        <div style={{
          background: 'var(--pb-surface)',
          border: '1px solid var(--pb-border)',
          borderRadius: 16,
          padding: '18px 22px',
          marginBottom: 28,
          boxShadow: 'var(--pb-shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#aaa"
              strokeWidth={2}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search by name, email or role…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                paddingLeft: 40,
                paddingRight: 16,
                paddingTop: 10,
                paddingBottom: 10,
                border: '1.5px solid var(--pb-border)',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'var(--pb-font-body)',
                color: 'var(--pb-plum)',
                background: 'var(--pb-tint)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--pb-rose)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--pb-border)'; }}
            />
          </div>

          {/* Role filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ROLE_TABS.map(tab => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    fontFamily: 'var(--pb-font-body)',
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid var(--pb-rose)' : '1.5px solid var(--pb-border)',
                    background: isSelected ? 'var(--pb-rose)' : 'transparent',
                    color: isSelected ? '#fff' : '#666',
                    transition: 'all 0.15s',
                    letterSpacing: '0.02em',
                  }}
                >
                  {tab}
                </button>
              );
            })}
            {filteredUsers.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                fontSize: 13,
                fontFamily: 'var(--pb-font-body)',
                color: '#999',
                alignSelf: 'center',
              }}>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* User Grid */}
        {filteredUsers.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20,
          }}>
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: '#aaa',
            fontFamily: 'var(--pb-font-body)',
          }}>
            <Users size={48} color="#ddd" strokeWidth={1.2} style={{ marginBottom: 16 }} />
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>No users found</p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
