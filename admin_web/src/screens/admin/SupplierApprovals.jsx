import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Flower2,
  Users,
  Leaf,
  ChevronRight,
} from 'lucide-react';

// ── Static data ───────────────────────────────────────────────────────────────

const INITIAL_PENDING = [
  { id: 'APP-201', farm: 'Hakgala Mist Rose Estate',  owner: 'Ranjith Karunaratne', city: 'Nuwara Eliya', crop: '🌹 Red Roses',          capacity: '18,000 stems/mo', days: 3  },
  { id: 'APP-202', farm: 'Welimada Orchid Gardens',   owner: 'Priya Senaratne',     city: 'Welimada',     crop: '🌸 Orchids',             capacity: '12,500 stems/mo', days: 5  },
  { id: 'APP-203', farm: 'Bandarawela Lily Farm',     owner: 'Chaminda Alwis',      city: 'Bandarawela',  crop: '🌷 Asiatic Lilies',      capacity: '9,800 stems/mo',  days: 7  },
  { id: 'APP-204', farm: 'Pussellawa Rose Hill',      owner: 'Kumari Jayasinghe',   city: 'Kandy',        crop: '🌹 White Roses',          capacity: '14,200 stems/mo', days: 8  },
  { id: 'APP-205', farm: 'Nanu Oya Flora',            owner: 'Suresh Bandara',      city: 'Nuwara Eliya', crop: '💐 Mixed Cut Flowers',   capacity: '22,000 stems/mo', days: 10 },
  { id: 'APP-206', farm: 'Horton Plains Nursery',     owner: 'Dilshan Perera',      city: 'Nuwara Eliya', crop: '🌺 Anthuriums',           capacity: '7,600 stems/mo',  days: 12 },
  { id: 'APP-207', farm: 'Ragala Green House',        owner: 'Sanduni Rathnayake',  city: 'Welimada',     crop: '🌼 Chrysanthemums',       capacity: '11,400 stems/mo', days: 14 },
];

const INITIAL_APPROVED = [
  { id: 'APP-101', farm: 'Ceylon Rose Gardens',       owner: 'Nimal Fernando',      city: 'Kandy',        crop: '🌹 Hybrid Roses',         capacity: '25,000 stems/mo' },
  { id: 'APP-102', farm: 'Dimbula Flower Valley',     owner: 'Anoma Wickramasinghe',city: 'Nuwara Eliya', crop: '🌷 Tulips & Lilies',      capacity: '16,500 stems/mo' },
  { id: 'APP-103', farm: 'Ella Bloom Collective',     owner: 'Ruwan Dissanayake',   city: 'Badulla',      crop: '💐 Seasonal Bouquets',    capacity: '19,000 stems/mo' },
];

const INITIAL_DECLINED = [
  { id: 'APP-098', farm: 'Ratnapura Tropical Flora',  owner: 'Kasun Liyanage',      city: 'Ratnapura',    crop: '🌺 Heliconias',           capacity: '5,200 stems/mo'  },
  { id: 'APP-099', farm: 'Galle Coastal Orchids',     owner: 'Thilini Mendis',      city: 'Galle',        crop: '🌸 Orchids',              capacity: '4,800 stems/mo'  },
];

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--pb-tint)',
    fontFamily: 'var(--pb-font-body)',
    paddingBottom: '3rem',
  },
  inner: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '0 1.5rem',
  },

  // KPI row
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  kpiCard: (accent) => ({
    background: '#fff',
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    padding: '1.4rem 1.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.1rem',
    boxShadow: 'var(--pb-shadow)',
    position: 'relative',
    overflow: 'hidden',
  }),
  kpiIconWrap: (accent) => ({
    width: 52,
    height: 52,
    borderRadius: 14,
    background: `${accent}18`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  kpiNumber: {
    fontFamily: 'var(--pb-font-heading)',
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1,
    color: 'var(--pb-plum)',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: '0.82rem',
    color: '#888',
    letterSpacing: '0.02em',
    fontWeight: 500,
  },
  kpiStripe: (accent) => ({
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 5,
    background: accent,
    borderRadius: '0 16px 16px 0',
  }),

  // Tab bar
  tabBar: {
    display: 'flex',
    gap: 4,
    background: '#fff',
    border: '1px solid var(--pb-border)',
    borderRadius: 12,
    padding: 5,
    marginBottom: '1.75rem',
    width: 'fit-content',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  tab: (active) => ({
    padding: '0.5rem 1.3rem',
    borderRadius: 9,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--pb-font-body)',
    fontWeight: active ? 700 : 500,
    fontSize: '0.9rem',
    background: active ? 'var(--pb-rose)' : 'transparent',
    color: active ? '#fff' : 'var(--pb-plum)',
    transition: 'all 0.18s ease',
    whiteSpace: 'nowrap',
  }),

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))',
    gap: '1.25rem',
  },

  // Pending card
  pendingCard: {
    background: '#fff',
    border: '1px solid var(--pb-border)',
    borderRadius: 16,
    padding: '1.4rem 1.5rem',
    boxShadow: 'var(--pb-shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'box-shadow 0.2s',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  farmName: {
    fontFamily: 'var(--pb-font-heading)',
    fontSize: '1.08rem',
    fontWeight: 700,
    color: 'var(--pb-plum)',
    lineHeight: 1.25,
  },
  daysBadge: {
    background: '#f3f3f3',
    color: '#777',
    fontSize: '0.74rem',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.86rem',
    color: '#666',
  },
  divider: {
    height: 1,
    background: 'var(--pb-border)',
    borderRadius: 2,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem 1rem',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  detailLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  detailValue: {
    fontSize: '0.9rem',
    color: 'var(--pb-plum)',
    fontWeight: 500,
  },
  btnRow: {
    display: 'flex',
    gap: '0.65rem',
    marginTop: '0.25rem',
  },
  approveBtn: {
    flex: 1,
    padding: '0.55rem 0',
    borderRadius: 10,
    border: 'none',
    background: 'var(--pb-leaf)',
    color: '#fff',
    fontFamily: 'var(--pb-font-body)',
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    transition: 'opacity 0.15s',
  },
  declineBtn: {
    flex: 1,
    padding: '0.55rem 0',
    borderRadius: 10,
    border: '2px solid #e05c5c',
    background: 'transparent',
    color: '#e05c5c',
    fontFamily: 'var(--pb-font-body)',
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    transition: 'background 0.15s',
  },

  // Approved / Declined list cards
  listCard: (accent) => ({
    background: '#fff',
    border: `1.5px solid ${accent}33`,
    borderRadius: 14,
    padding: '1.1rem 1.4rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  }),
  listCardIcon: (accent) => ({
    width: 42,
    height: 42,
    borderRadius: 11,
    background: `${accent}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  listCardBody: {
    flex: 1,
    minWidth: 0,
  },
  listCardFarm: {
    fontFamily: 'var(--pb-font-heading)',
    fontSize: '0.98rem',
    fontWeight: 700,
    color: 'var(--pb-plum)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  listCardMeta: {
    fontSize: '0.82rem',
    color: '#888',
    marginTop: 2,
  },
  statusBadge: (color, bg) => ({
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: '0.76rem',
    fontWeight: 700,
    color: color,
    background: bg,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  }),

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#bbb',
  },
  emptyIcon: {
    marginBottom: '1rem',
    opacity: 0.4,
  },
  emptyText: {
    fontFamily: 'var(--pb-font-heading)',
    fontSize: '1.1rem',
    color: '#ccc',
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, number, label, accent }) {
  return (
    <div style={s.kpiCard(accent)}>
      <div style={s.kpiIconWrap(accent)}>
        <Icon size={24} color={accent} strokeWidth={2.2} />
      </div>
      <div>
        <div style={s.kpiNumber}>{number}</div>
        <div style={s.kpiLabel}>{label}</div>
      </div>
      <div style={s.kpiStripe(accent)} />
    </div>
  );
}

function PendingCard({ grower, onApprove, onDecline }) {
  return (
    <div style={s.pendingCard}>
      {/* Top row */}
      <div style={s.cardTopRow}>
        <div style={s.farmName}>{grower.farm}</div>
        <span style={s.daysBadge}>
          {grower.days === 1 ? '1 day ago' : `${grower.days} days ago`}
        </span>
      </div>

      {/* Owner + region */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={s.metaRow}>
          <Users size={14} color="var(--pb-plum)" />
          <span style={{ color: 'var(--pb-plum)', fontWeight: 600 }}>{grower.owner}</span>
        </div>
        <div style={s.metaRow}>
          <MapPin size={14} color="var(--pb-rose)" />
          <span>{grower.city}</span>
        </div>
      </div>

      <div style={s.divider} />

      {/* Detail grid */}
      <div style={s.detailGrid}>
        <div style={s.detailItem}>
          <span style={s.detailLabel}>Primary Crop</span>
          <span style={s.detailValue}>{grower.crop}</span>
        </div>
        <div style={s.detailItem}>
          <span style={s.detailLabel}>Est. Capacity</span>
          <span style={s.detailValue}>{grower.capacity}</span>
        </div>
        <div style={s.detailItem}>
          <span style={s.detailLabel}>Application ID</span>
          <span style={{ ...s.detailValue, fontSize: '0.82rem', color: '#aaa', fontFamily: 'monospace' }}>{grower.id}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={s.btnRow}>
        <button style={s.approveBtn} onClick={() => onApprove(grower)}>
          <CheckCircle size={15} />
          Approve
        </button>
        <button style={s.declineBtn} onClick={() => onDecline(grower)}>
          <XCircle size={15} />
          Decline
        </button>
      </div>
    </div>
  );
}

function ApprovedCard({ grower }) {
  const accent = '#22c55e';
  return (
    <div style={s.listCard(accent)}>
      <div style={s.listCardIcon(accent)}>
        <CheckCircle size={20} color={accent} strokeWidth={2.2} />
      </div>
      <div style={s.listCardBody}>
        <div style={s.listCardFarm}>{grower.farm}</div>
        <div style={s.listCardMeta}>
          {grower.owner} &nbsp;·&nbsp;
          <MapPin size={11} style={{ verticalAlign: 'middle' }} /> {grower.city} &nbsp;·&nbsp;
          {grower.crop} &nbsp;·&nbsp; {grower.capacity}
        </div>
      </div>
      <span style={s.statusBadge('#16a34a', '#dcfce7')}>Approved</span>
    </div>
  );
}

function DeclinedCard({ grower }) {
  const accent = '#e05c5c';
  return (
    <div style={s.listCard(accent)}>
      <div style={s.listCardIcon(accent)}>
        <XCircle size={20} color={accent} strokeWidth={2.2} />
      </div>
      <div style={s.listCardBody}>
        <div style={s.listCardFarm}>{grower.farm}</div>
        <div style={s.listCardMeta}>
          {grower.owner} &nbsp;·&nbsp;
          <MapPin size={11} style={{ verticalAlign: 'middle' }} /> {grower.city} &nbsp;·&nbsp;
          {grower.crop} &nbsp;·&nbsp; {grower.capacity}
        </div>
      </div>
      <span style={s.statusBadge('#b91c1c', '#fee2e2')}>Declined</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={s.emptyState}>
      <div style={s.emptyIcon}>
        <Flower2 size={56} color="var(--pb-rose)" />
      </div>
      <p style={s.emptyText}>{message}</p>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SupplierApprovals() {
  const [activeTab, setActiveTab]       = useState('pending');
  const [pendingList, setPendingList]   = useState(INITIAL_PENDING);
  const [approvedList, setApprovedList] = useState(INITIAL_APPROVED);
  const [declinedList, setDeclinedList] = useState(INITIAL_DECLINED);

  const handleApprove = (grower) => {
    setPendingList((prev) => prev.filter((g) => g.id !== grower.id));
    setApprovedList((prev) => [{ ...grower }, ...prev]);
  };

  const handleDecline = (grower) => {
    setPendingList((prev) => prev.filter((g) => g.id !== grower.id));
    setDeclinedList((prev) => [{ ...grower }, ...prev]);
  };

  const tabs = [
    { key: 'pending',  label: `Pending (${pendingList.length})`  },
    { key: 'approved', label: `Approved (${approvedList.length})` },
    { key: 'declined', label: `Declined (${declinedList.length})` },
  ];

  return (
    <div style={s.page}>
      <div style={s.inner}>
        {/* Page header */}
        <PageHeader
          title="Supplier Approvals"
          subtitle="Review and approve new grower applications"
        />

        {/* KPI row */}
        <div style={s.kpiRow}>
          <KpiCard
            icon={Clock}
            number={pendingList.length}
            label="Pending Review"
            accent="#f97316"
          />
          <KpiCard
            icon={CheckCircle}
            number={approvedList.length}
            label="Approved This Month"
            accent="#22c55e"
          />
          <KpiCard
            icon={Users}
            number={38}
            label="Active Partners"
            accent="var(--pb-plum)"
          />
        </div>

        {/* Tab bar */}
        <div style={s.tabBar}>
          {tabs.map((t) => (
            <button
              key={t.key}
              style={s.tab(activeTab === t.key)}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'pending' && (
          pendingList.length === 0 ? (
            <EmptyState message="All applications have been reviewed — nothing pending!" />
          ) : (
            <div style={s.grid}>
              {pendingList.map((grower) => (
                <PendingCard
                  key={grower.id}
                  grower={grower}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'approved' && (
          approvedList.length === 0 ? (
            <EmptyState message="No approved suppliers yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {approvedList.map((grower) => (
                <ApprovedCard key={grower.id} grower={grower} />
              ))}
            </div>
          )
        )}

        {activeTab === 'declined' && (
          declinedList.length === 0 ? (
            <EmptyState message="No declined applications." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {declinedList.map((grower) => (
                <DeclinedCard key={grower.id} grower={grower} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
