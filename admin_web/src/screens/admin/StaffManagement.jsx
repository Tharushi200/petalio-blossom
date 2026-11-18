import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import {
  UserPlus,
  Users,
  Activity,
  Calendar,
  Clock,
  X,
  Mail,
  Phone,
  User,
  ShieldCheck,
} from 'lucide-react';

const initialStaff = [
  { id: 1,  name: 'Anuki Perera',       role: 'Admin',            email: 'anuki@petalio.lk',    lastActive: 'Just now',  status: 'Active',   initials: 'AP', color: '#c0376b' },
  { id: 2,  name: 'Kasun Silva',         role: 'Business Officer', email: 'kasun@petalio.lk',    lastActive: '1 hr ago',  status: 'Active',   initials: 'KS', color: '#7c3aed' },
  { id: 3,  name: 'Thilini Fernando',    role: 'Business Officer', email: 'thilini@petalio.lk',  lastActive: '3 hrs ago', status: 'Active',   initials: 'TF', color: '#0891b2' },
  { id: 4,  name: 'Buddhika Perera',     role: 'Business Officer', email: 'buddhika@petalio.lk', lastActive: 'Yesterday', status: 'Inactive', initials: 'BP', color: '#7c3aed' },
  { id: 5,  name: 'Hasini Wijeratne',    role: 'Logistics',        email: 'hasini@petalio.lk',   lastActive: '2 hrs ago', status: 'Active',   initials: 'HW', color: '#059669' },
  { id: 6,  name: 'Dinesh Kumara',       role: 'Logistics',        email: 'dinesh@petalio.lk',   lastActive: '5 hrs ago', status: 'Active',   initials: 'DK', color: '#059669' },
  { id: 7,  name: 'Malika Jayawardena',  role: 'Warehouse',        email: 'malika@petalio.lk',   lastActive: '1 day ago', status: 'Active',   initials: 'MJ', color: '#d97706' },
  { id: 8,  name: 'Ruwan Bandara',       role: 'Warehouse',        email: 'ruwan@petalio.lk',    lastActive: '3 days ago',status: 'Inactive', initials: 'RB', color: '#d97706' },
  { id: 9,  name: 'Sachini Rathnayake',  role: 'Quality Control',  email: 'sachini@petalio.lk',  lastActive: '4 hrs ago', status: 'Active',   initials: 'SR', color: '#c0376b' },
  { id: 10, name: 'Pradeep Herath',      role: 'Quality Control',  email: 'pradeep@petalio.lk',  lastActive: '2 days ago',status: 'Inactive', initials: 'PH', color: '#c0376b' },
  { id: 11, name: 'Nimesha Perera',      role: 'Business Officer', email: 'nimesha@petalio.lk',  lastActive: '6 hrs ago', status: 'Active',   initials: 'NP', color: '#7c3aed' },
];

const roleBadgeStyle = (role) => {
  const map = {
    'Admin':            { background: 'rgba(192,55,107,0.12)', color: '#c0376b', border: '1px solid rgba(192,55,107,0.3)' },
    'Business Officer': { background: 'rgba(124,58,237,0.12)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.3)' },
    'Logistics':        { background: 'rgba(5,150,105,0.12)',  color: '#059669', border: '1px solid rgba(5,150,105,0.3)' },
    'Warehouse':        { background: 'rgba(217,119,6,0.12)',  color: '#d97706', border: '1px solid rgba(217,119,6,0.3)' },
    'Quality Control':  { background: 'rgba(8,145,178,0.12)',  color: '#0891b2', border: '1px solid rgba(8,145,178,0.3)' },
  };
  return map[role] || { background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' };
};

const KpiCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div style={{
    background: 'var(--pb-surface)',
    border: '1px solid var(--pb-border)',
    borderRadius: 16,
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    boxShadow: 'var(--pb-shadow)',
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={24} color={iconColor} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--pb-font-heading)', color: 'var(--pb-plum)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, fontFamily: 'var(--pb-font-body)' }}>
        {label}
      </div>
    </div>
  </div>
);

const StaffCard = ({ member, onToggleStatus, onResetPassword }) => {
  const isActive = member.status === 'Active';
  const badge = roleBadgeStyle(member.role);

  return (
    <div style={{
      background: 'var(--pb-surface)',
      border: '1px solid var(--pb-border)',
      borderRadius: 20,
      padding: '28px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0,
      boxShadow: 'var(--pb-shadow)',
      position: 'relative',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Status dot */}
      <div style={{
        position: 'absolute', top: 18, right: 18,
        width: 11, height: 11, borderRadius: '50%',
        background: isActive ? '#22c55e' : '#d1d5db',
        border: '2px solid #fff',
        boxShadow: isActive ? '0 0 0 3px rgba(34,197,94,0.18)' : 'none',
      }} />

      {/* Avatar */}
      <div style={{
        width: 68, height: 68, borderRadius: '50%',
        background: member.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 700, color: '#fff',
        fontFamily: 'var(--pb-font-heading)',
        marginBottom: 14,
        boxShadow: `0 4px 14px ${member.color}55`,
        letterSpacing: 1,
      }}>
        {member.initials}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 17, fontWeight: 700,
        fontFamily: 'var(--pb-font-heading)',
        color: 'var(--pb-plum)',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        {member.name}
      </div>

      {/* Role badge */}
      <div style={{
        fontSize: 11, fontWeight: 600,
        padding: '3px 12px', borderRadius: 20,
        marginBottom: 10,
        fontFamily: 'var(--pb-font-body)',
        letterSpacing: 0.4,
        ...badge,
      }}>
        {member.role}
      </div>

      {/* Email */}
      <div style={{
        fontSize: 12, color: '#9ca3af',
        fontFamily: 'var(--pb-font-body)',
        marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <Mail size={12} color="#9ca3af" />
        {member.email}
      </div>

      {/* Last active */}
      <div style={{
        fontSize: 12, color: '#b0b8c6',
        fontFamily: 'var(--pb-font-body)',
        display: 'flex', alignItems: 'center', gap: 5,
        marginBottom: 18,
      }}>
        <Clock size={12} color="#b0b8c6" />
        {member.lastActive}
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: 1, background: 'var(--pb-border)', marginBottom: 14 }} />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        <button
          onClick={() => onToggleStatus(member.id)}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--pb-font-body)',
            background: isActive
              ? 'rgba(239,68,68,0.09)'
              : 'rgba(34,197,94,0.1)',
            color: isActive ? '#ef4444' : '#16a34a',
            transition: 'background 0.2s',
          }}
        >
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => onResetPassword(member.email)}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            border: '1.5px solid var(--pb-border)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--pb-font-body)',
            background: 'transparent',
            color: 'var(--pb-plum)',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

const AddStaffModal = ({ onClose, onInvite }) => {
  const [form, setForm] = useState({ name: '', email: '', role: 'Business Officer', phone: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    onInvite();
    onClose();
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid var(--pb-border)',
    fontFamily: 'var(--pb-font-body)',
    fontSize: 14,
    color: 'var(--pb-plum)',
    background: 'var(--pb-tint)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    fontFamily: 'var(--pb-font-body)',
    marginBottom: 6,
    display: 'block',
    letterSpacing: 0.3,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(30,10,30,0.38)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '32px 32px 28px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(80,0,40,0.18)',
        position: 'relative',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 18, right: 18,
            background: 'var(--pb-tint)', border: 'none',
            borderRadius: 10, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} color="#6b7280" />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'rgba(192,55,107,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UserPlus size={20} color="var(--pb-rose)" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--pb-font-heading)', color: 'var(--pb-plum)' }}>
            Add Staff Member
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Sanduni Perera"
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                name="email" value={form.email} onChange={handleChange}
                placeholder="name@petalio.lk" type="email"
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Role</label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <select
                name="role" value={form.role} onChange={handleChange}
                style={{ ...inputStyle, paddingLeft: 34, appearance: 'none', cursor: 'pointer' }}
              >
                <option>Admin</option>
                <option>Business Officer</option>
                <option>Logistics</option>
                <option>Warehouse</option>
                <option>Quality Control</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Phone</label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                name="phone" value={form.phone} onChange={handleChange}
                placeholder="+94 7X XXX XXXX" type="tel"
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1, padding: '11px 0',
              borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--pb-rose) 0%, var(--pb-plum) 100%)',
              color: '#fff', fontWeight: 700,
              fontSize: 14, fontFamily: 'var(--pb-font-body)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(192,55,107,0.3)',
            }}
          >
            Send Invite
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px 0',
              borderRadius: 12,
              border: '1.5px solid var(--pb-border)',
              background: 'transparent',
              color: '#6b7280', fontWeight: 600,
              fontSize: 14, fontFamily: 'var(--pb-font-body)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message }) => (
  <div style={{
    position: 'fixed', bottom: 28, right: 28,
    background: 'var(--pb-plum)',
    color: '#fff',
    padding: '13px 22px',
    borderRadius: 14,
    fontSize: 13,
    fontFamily: 'var(--pb-font-body)',
    fontWeight: 600,
    boxShadow: '0 8px 32px rgba(80,0,40,0.22)',
    zIndex: 2000,
    display: 'flex', alignItems: 'center', gap: 10,
    animation: 'fadeSlideIn 0.3s ease',
  }}>
    <div style={{
      width: 8, height: 8, borderRadius: '50%',
      background: '#4ade80', flexShrink: 0,
    }} />
    {message}
  </div>
);

export default function StaffManagement() {
  const [staffList, setStaffList] = useState(initialStaff);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggleStatus = (id) => {
    setStaffList((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' }
          : m
      )
    );
  };

  const handleResetPassword = (email) => {
    showToast(`Password reset link sent to ${email}`);
  };

  const handleInvite = () => {
    showToast('Invite sent!');
  };

  const totalStaff  = staffList.length;
  const activeNow   = staffList.filter((m) => m.status === 'Active').length;
  const onLeave     = staffList.filter((m) => m.status === 'Inactive').length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--pb-tint)',
      fontFamily: 'var(--pb-font-body)',
      padding: '0 0 48px',
    }}>
      {/* Page Header */}
      <PageHeader
        title="Staff & Team"
        subtitle="Manage your team members and their access"
        rightContent={
          <Button
            onClick={() => setShowModal(true)}
            icon={<UserPlus size={16} />}
            style={{
              background: 'linear-gradient(135deg, var(--pb-rose) 0%, var(--pb-plum) 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: 14,
              fontFamily: 'var(--pb-font-body)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(192,55,107,0.28)',
            }}
          >
            Add Staff Member
          </Button>
        }
      />

      <div style={{ padding: '32px 36px 0' }}>

        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 36,
        }}>
          <KpiCard
            icon={Users}
            label="Total Staff"
            value={totalStaff}
            iconBg="rgba(124,58,237,0.12)"
            iconColor="#7c3aed"
          />
          <KpiCard
            icon={Activity}
            label="Active Now"
            value={activeNow}
            iconBg="rgba(5,150,105,0.12)"
            iconColor="#059669"
          />
          <KpiCard
            icon={Calendar}
            label="On Leave / Inactive"
            value={onLeave}
            iconBg="rgba(217,119,6,0.12)"
            iconColor="#d97706"
          />
        </div>

        {/* Section label */}
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'var(--pb-font-heading)',
          color: 'var(--pb-plum)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Users size={17} color="var(--pb-rose)" />
          All Team Members
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: 'rgba(192,55,107,0.1)',
            color: 'var(--pb-rose)',
            padding: '2px 10px',
            borderRadius: 20,
            marginLeft: 4,
          }}>
            {totalStaff}
          </span>
        </div>

        {/* Staff Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 22,
        }}>
          {staffList.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onToggleStatus={handleToggleStatus}
              onResetPassword={handleResetPassword}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onInvite={handleInvite}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} />}

      {/* Keyframe style injected inline */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
