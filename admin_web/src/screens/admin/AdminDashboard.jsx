import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  UserPlus,
  Server,
  Flower2,
  Clock,
  ArrowUpRight,
  Database,
  Smartphone,
  Check,
  X,
  ChevronRight
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

//  Clean Growth & Performance Data (Last 6 Months) ─────────────────────────
const PERFORMANCE_DATA = [
  { month: 'Jun', revenue: 2.8, orders: 1850 },
  { month: 'Jul', revenue: 3.4, orders: 2150 },
  { month: 'Aug', revenue: 3.9, orders: 2420 },
  { month: 'Sep', revenue: 4.5, orders: 2780 },
  { month: 'Oct', revenue: 5.2, orders: 3120 },
  { month: 'Nov', revenue: 6.85, orders: 3420 }
];

// ─── Initial Pending Supplier Applications ───────────────────────────────────
const INITIAL_PENDING_GROWERS = [
  {
    id: 'APP-201',
    farmName: 'Hakgala Mist Rose Estate',
    owner: 'Ranjith Karunaratne',
    region: 'Nuwara Eliya',
    primaryCrop: 'Highland Roses',
    cropEmoji: '🌹',
    capacity: '15,000 stems/mo',
    submittedDate: 'Today, 10:30 AM'
  },
  {
    id: 'APP-202',
    farmName: 'Welimada Lily Greenhouses',
    owner: 'Chamari Gunasekara',
    region: 'Welimada',
    primaryCrop: 'Oriental Lilies',
    cropEmoji: '🌷',
    capacity: '8,500 stems/mo',
    submittedDate: 'Yesterday'
  },
  {
    id: 'APP-203',
    farmName: 'Ella Shaded Orchid Blooms',
    owner: 'Dhammika Bandara',
    region: 'Badulla / Ella',
    primaryCrop: 'Dendrobium Orchids',
    cropEmoji: '🪷',
    capacity: '6,200 stems/mo',
    submittedDate: 'Nov 06'
  }
];

// ─── Recent Audit & Governance Feed ──────────────────────────────────────────
const INITIAL_AUDIT_LOG = [
  {
    id: 'LOG-1',
    user: 'Anuki Perera (Officer)',
    action: 'Dispatched wholesale order #PB-1048 to Shangri-La Colombo',
    time: '25 mins ago',
    tag: 'Order'
  },
  {
    id: 'LOG-2',
    user: 'System Bot',
    action: 'AI Demand Forecast recalculated for Upcoming Wedding Season',
    time: '2 hours ago',
    tag: 'AI/ML'
  },
  {
    id: 'LOG-3',
    user: 'Tharusha (Admin)',
    action: 'Updated wholesale base pricing for Grade A+ Red Naomi Roses',
    time: '5 hours ago',
    tag: 'Pricing'
  },
  {
    id: 'LOG-4',
    user: 'Automated Backup',
    action: 'Nightly cloud database backup completed successfully (42.8 MB)',
    time: '02:00 AM',
    tag: 'Backup'
  }
];

export default function AdminDashboard() {
  const [metricView, setMetricView] = useState('revenue'); // 'revenue' | 'orders'
  const [pendingGrowers, setPendingGrowers] = useState(INITIAL_PENDING_GROWERS);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedGrowerModal, setSelectedGrowerModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // New Staff Form State
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'BUSINESS_OFFICER',
    phone: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApproveGrower = (grower) => {
    setPendingGrowers((prev) => prev.filter((g) => g.id !== grower.id));
    setAuditLog((prev) => [
      {
        id: `LOG-${Date.now()}`,
        user: 'Tharusha (Admin)',
        action: `Approved farm partner account for ${grower.farmName} (${grower.region})`,
        time: 'Just now',
        tag: 'Accreditation'
      },
      ...prev
    ]);
    setSelectedGrowerModal(null);
    showToast(`Approved ${grower.farmName} as an active supplier!`);
  };

  const handleDeclineGrower = (grower) => {
    setPendingGrowers((prev) => prev.filter((g) => g.id !== grower.id));
    setSelectedGrowerModal(null);
    showToast(`Declined application for ${grower.farmName}.`);
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) {
      showToast('Please fill in staff name and email.');
      return;
    }
    setAuditLog((prev) => [
      {
        id: `LOG-${Date.now()}`,
        user: 'Tharusha (Admin)',
        action: `Created new ${newStaff.role.replace('_', ' ')} account for ${newStaff.name}`,
        time: 'Just now',
        tag: 'Staff'
      },
      ...prev
    ]);
    setShowAddStaffModal(false);
    showToast(`Staff member "${newStaff.name}" added successfully!`);
    setNewStaff({ name: '', email: '', role: 'BUSINESS_OFFICER', phone: '' });
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--pb-plum)',
            color: '#FFFFFF',
            padding: '0.8rem 1.25rem',
            borderRadius: '10px',
            boxShadow: 'var(--pb-shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            fontSize: '0.84rem',
            fontWeight: 600,
            animation: 'fadeInDown 0.2s ease'
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--pb-rose-soft)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Executive Page Header ─────────────────────────────────── */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="Executive system overview, grower approvals, and business health"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => showToast('Monthly Executive Summary downloaded (PDF).')}
            >
              Export Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => setShowAddStaffModal(true)}
            >
              Add Staff User
            </Button>
          </div>
        }
      />

      {/* ── 4 Clean, Aesthetic KPI Cards ────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        {[
          {
            label: 'Total Platform Revenue',
            value: 'Rs 18.4M',
            sub: '+14.2% vs last month',
            icon: TrendingUp,
            color: 'var(--pb-rose)',
            bg: 'var(--pb-tint)'
          },
          {
            label: 'Active System Users',
            value: '1,280',
            sub: '940 Mobile · 24 Farms · 6 Staff',
            icon: Users,
            color: '#0284C7',
            bg: 'rgba(2, 132, 199, 0.1)'
          },
          {
            label: 'Commercial Orders',
            value: '3,420',
            sub: '98.5% on-time delivery rate',
            icon: Flower2,
            color: 'var(--pb-leaf)',
            bg: 'var(--pb-leaf-tint)'
          },
          {
            label: 'Grower Approvals',
            value: `${pendingGrowers.length} Pending`,
            sub: pendingGrowers.length > 0 ? 'Action required' : 'All caught up',
            icon: ShieldCheck,
            color: pendingGrowers.length > 0 ? '#B91C1C' : 'var(--pb-leaf)',
            bg: pendingGrowers.length > 0 ? '#FEF2F2' : 'var(--pb-leaf-tint)'
          }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                background: 'var(--pb-surface)',
                border: '1.5px solid var(--pb-border)',
                borderRadius: '14px',
                padding: '1rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                boxShadow: 'var(--pb-shadow)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '11px',
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--pb-plum)',
                    fontFamily: 'var(--pb-font-heading)',
                    lineHeight: 1.1
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)', fontWeight: 600, marginTop: '2px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: stat.color, fontWeight: 700, marginTop: '1px' }}>
                  {stat.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2-Column Split: Performance Chart vs Pending Approvals ───── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.45fr 1fr',
          gap: '1.25rem',
          marginBottom: '1.25rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Platform Growth Chart */}
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1.5px solid var(--pb-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--pb-shadow)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--pb-plum)',
                  fontFamily: 'var(--pb-font-heading)'
                }}
              >
                Platform Performance Trend
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: 'var(--pb-text-muted)' }}>
                Track business revenue velocity and wholesale flower order volume
              </p>
            </div>

            {/* Metric Toggle Buttons */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--pb-blush)',
                borderRadius: '8px',
                padding: '2px',
                border: '1px solid var(--pb-border)'
              }}
            >
              <button
                type="button"
                onClick={() => setMetricView('revenue')}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: metricView === 'revenue' ? 'var(--pb-rose)' : 'transparent',
                  color: metricView === 'revenue' ? '#FFFFFF' : 'var(--pb-plum)',
                  transition: 'all 0.15s ease'
                }}
              >
                Revenue (LKR)
              </button>
              <button
                type="button"
                onClick={() => setMetricView('orders')}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: metricView === 'orders' ? 'var(--pb-plum)' : 'transparent',
                  color: metricView === 'orders' ? '#FFFFFF' : 'var(--pb-plum)',
                  transition: 'all 0.15s ease'
                }}
              >
                Order Volume
              </button>
            </div>
          </div>

          {/* Area Chart */}
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={metricView === 'revenue' ? 'var(--pb-rose)' : 'var(--pb-plum)'}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={metricView === 'revenue' ? 'var(--pb-rose)' : 'var(--pb-plum)'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--pb-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--pb-text-muted)' }} stroke="var(--pb-border)" />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--pb-text-muted)' }}
                  stroke="var(--pb-border)"
                  tickFormatter={(val) => (metricView === 'revenue' ? `Rs ${val}M` : val)}
                />
                <Tooltip
                  formatter={(val) => [
                    metricView === 'revenue' ? `Rs ${val} Million` : `${val.toLocaleString()} Orders`,
                    metricView === 'revenue' ? 'Monthly Revenue' : 'Wholesale Orders'
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--pb-surface)',
                    borderRadius: '10px',
                    border: '1.5px solid var(--pb-border)',
                    boxShadow: 'var(--pb-shadow)',
                    fontSize: '0.78rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metricView}
                  stroke={metricView === 'revenue' ? 'var(--pb-rose)' : 'var(--pb-plum)'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#adminChartGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Pending Supplier Approvals (Actionable) */}
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1.5px solid var(--pb-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--pb-shadow)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--pb-plum)',
                    fontFamily: 'var(--pb-font-heading)'
                  }}
                >
                  Grower Accreditation Queue
                </h3>
                {pendingGrowers.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '6px',
                      background: '#FEE2E2',
                      color: '#B91C1C'
                    }}
                  >
                    {pendingGrowers.length} New
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>
                New highland flower farms waiting for verification
              </p>
            </div>
          </div>

          {/* List of Applications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {pendingGrowers.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1rem',
                  background: 'var(--pb-blush)',
                  borderRadius: '12px'
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>✨</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--pb-plum)' }}>
                  All Caught Up!
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--pb-text-muted)' }}>
                  No pending grower applications waiting for approval.
                </div>
              </div>
            ) : (
              pendingGrowers.map((grower) => (
                <div
                  key={grower.id}
                  style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: '12px',
                    background: 'var(--pb-blush)',
                    border: '1px solid var(--pb-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>{grower.cropEmoji}</span>
                      <strong style={{ fontSize: '0.84rem', color: 'var(--pb-plum)' }}>
                        {grower.farmName}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--pb-text-muted)', marginTop: '2px' }}>
                      {grower.owner} · {grower.region} · {grower.capacity}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleApproveGrower(grower)}
                      title="Approve Grower"
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--pb-rose)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Check size={12} strokeWidth={3} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineGrower(grower)}
                      title="Decline"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--pb-border)',
                        background: 'var(--pb-surface)',
                        color: 'var(--pb-text-muted)',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: System Health + Recent Audit Feed ───────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: '1.25rem',
          alignItems: 'start'
        }}
      >
        {/* Live Ecosystem Health */}
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1.5px solid var(--pb-border)',
            borderRadius: '16px',
            padding: '1.15rem 1.25rem',
            boxShadow: 'var(--pb-shadow)'
          }}
        >
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--pb-plum)', marginBottom: '0.2rem' }}>
            System Infrastructure Status
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)', marginBottom: '0.85rem' }}>
            Live status of Petalio Blossom servers and external APIs
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              { label: 'PostgreSQL Database', sub: 'Primary replica · 24ms latency', status: 'Healthy', icon: Database },
              { label: 'Mobile App API Gateway', sub: 'Android App endpoints · 99.9% uptime', status: 'Healthy', icon: Smartphone },
              { label: 'AI Demand Forecasting Engine', sub: 'Prophet + Random Forest model', status: 'Online (94.2%)', icon: Sparkles },
              { label: 'Leaflet GPS Logistics Map', sub: 'Highland delivery routing', status: 'Active', icon: Server }
            ].map((srv) => {
              const SrvIcon = srv.icon;
              return (
                <div
                  key={srv.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    background: 'var(--pb-blush)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <SrvIcon size={16} style={{ color: 'var(--pb-rose)' }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)' }}>
                        {srv.label}
                      </div>
                      <div style={{ fontSize: '0.67rem', color: 'var(--pb-text-muted)' }}>
                        {srv.sub}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'var(--pb-leaf)',
                      background: 'var(--pb-leaf-tint)',
                      padding: '2px 7px',
                      borderRadius: '5px'
                    }}
                  >
                    ● {srv.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Governance & Activity Feed */}
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1.5px solid var(--pb-border)',
            borderRadius: '16px',
            padding: '1.15rem 1.25rem',
            boxShadow: 'var(--pb-shadow)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                Recent Governance Audit Log
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>
                Latest security events and officer operational actions
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--pb-rose)', fontWeight: 700 }}>
              Live Stream
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {auditLog.slice(0, 4).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  paddingBottom: '0.55rem',
                  borderBottom: '1px solid var(--pb-border)',
                  fontSize: '0.76rem',
                  gap: '0.65rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--pb-plum)' }}>
                    {item.user}
                  </div>
                  <div style={{ color: 'var(--pb-text-body)', marginTop: '1px', fontSize: '0.74rem' }}>
                    {item.action}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: 'var(--pb-tint)',
                      color: 'var(--pb-rose)'
                    }}
                  >
                    {item.tag}
                  </span>
                  <div style={{ fontSize: '0.68rem', color: 'var(--pb-text-muted)', marginTop: '2px' }}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal: Add Staff User ─────────────────────────────────── */}
      {showAddStaffModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 5, 12, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowAddStaffModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'var(--pb-surface)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: 'var(--pb-shadow)',
              border: '1.5px solid var(--pb-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} style={{ color: 'var(--pb-rose)' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                  Add Staff User
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pb-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid var(--pb-border)',
                    fontSize: '0.82rem',
                    background: 'var(--pb-blush)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="kasun@petalioblossom.lk"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid var(--pb-border)',
                    fontSize: '0.82rem',
                    background: 'var(--pb-blush)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  System Role
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid var(--pb-border)',
                    fontSize: '0.82rem',
                    background: 'var(--pb-blush)',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="BUSINESS_OFFICER">Business Officer (Operations, Orders, Inventory)</option>
                  <option value="ADMIN">System Administrator (Full Governance)</option>
                  <option value="LOGISTICS_DRIVER">Logistics & Delivery Fleet Lead</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddStaffModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save & Grant Access
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
