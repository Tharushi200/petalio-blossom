import React, { useState, useMemo } from 'react';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Plus,
  Search,
  X,
  ThermometerSnowflake,
  Calendar
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Clean Deliveries Dataset ─────────────────────────────────────────────────
const INITIAL_DELIVERIES = [
  {
    id: 'DEL-104',
    orderId: 'ORD-8841',
    van: 'Van #PB-04 (Chilled 4°C)',
    driver: 'Kamal Bandara',
    phone: '+94 77 123 4567',
    route: 'Nuwara Eliya ➔ Colombo Expressway',
    destination: 'The Kingsbury Hotel, Colombo 01',
    departureTime: '06:30 AM',
    estimatedArrival: '10:30 AM',
    stems: 600,
    status: 'IN_TRANSIT',
    temperature: '4.2°C'
  },
  {
    id: 'DEL-103',
    orderId: 'ORD-8840',
    van: 'Van #PB-02 (Insulated)',
    driver: 'Sunil Fonseka',
    phone: '+94 71 876 5432',
    route: 'Welimada Depot ➔ Rajagiriya',
    destination: 'Lassana Petals Studio, Rajagiriya',
    departureTime: '07:00 AM',
    estimatedArrival: '11:15 AM',
    stems: 450,
    status: 'IN_TRANSIT',
    temperature: '5.1°C'
  },
  {
    id: 'DEL-102',
    orderId: 'ORD-8839',
    van: 'Van #PB-01 (Express Chilled)',
    driver: 'Dinesh Silva',
    phone: '+94 76 999 8877',
    route: 'Hakgala Hub ➔ Galle Face',
    destination: 'Shangri-La Hotel, Colombo 02',
    departureTime: '05:45 AM',
    estimatedArrival: '09:45 AM',
    stems: 250,
    status: 'DELIVERED',
    temperature: '3.8°C'
  },
  {
    id: 'DEL-101',
    orderId: 'ORD-8837',
    van: 'Van #PB-03 (Insulated)',
    driver: 'Anura Kumara',
    phone: '+94 77 444 3322',
    route: 'Bandarawela ➔ Kollupitiya',
    destination: 'Galle Face Hotel Ballroom',
    departureTime: '08:00 AM',
    estimatedArrival: '12:30 PM',
    stems: 300,
    status: 'SCHEDULED',
    temperature: '4.0°C'
  }
];

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // New Delivery Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    orderId: 'ORD-8842',
    van: 'Van #PB-04 (Chilled 4°C)',
    driver: 'Kamal Bandara',
    phone: '+94 77 123 4567',
    route: 'Nuwara Eliya ➔ Colombo',
    destination: 'Cinnamon Grand Hotel, Colombo 03',
    departureTime: '07:00 AM',
    estimatedArrival: '11:00 AM',
    stems: 300
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── KPI Summary ─────────────────────────────────────────────────────────────
  const totalTrips = deliveries.length;
  const inTransitCount = deliveries.filter((d) => d.status === 'IN_TRANSIT').length;
  const completedCount = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const totalStemsMoved = deliveries.reduce((acc, d) => acc + d.stems, 0);

  // ── Filter & Search ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...deliveries];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.driver.toLowerCase().includes(q) ||
          d.destination.toLowerCase().includes(q) ||
          d.route.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((d) => d.status === statusFilter);
    }

    return list;
  }, [deliveries, search, statusFilter]);

  // ── Action: Mark Complete ───────────────────────────────────────────────────
  const handleMarkComplete = (delivery) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === delivery.id ? { ...d, status: 'DELIVERED' } : d))
    );
    showToast(`Delivery #${delivery.id} confirmed completed!`);
  };

  // ── Submit New Delivery ─────────────────────────────────────────────────────
  const handleCreateDelivery = (e) => {
    e.preventDefault();
    const newId = `DEL-${100 + deliveries.length + 1}`;
    const item = {
      id: newId,
      ...newForm,
      stems: parseInt(newForm.stems) || 200,
      status: 'SCHEDULED',
      temperature: '4.0°C'
    };

    setDeliveries([item, ...deliveries]);
    setShowAddModal(false);
    showToast(`🚚 Delivery trip #${newId} scheduled successfully!`);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--pb-plum)',
            color: '#fff',
            padding: '0.8rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} color="var(--pb-leaf)" />
          {toastMessage}
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Deliveries & Cold Logistics"
        subtitle="Schedule and track insulated van routes from highland flower farms to Colombo"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Schedule Delivery
          </Button>
        }
      />

      {/* ── 4 Simple KPI Cards ──────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          margin: '1.25rem 0 1.5rem 0'
        }}
      >
        <div
          style={{
            background: 'var(--pb-surface)',
            padding: '1.1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--pb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'var(--pb-blush)',
              color: 'var(--pb-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Scheduled Trips</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>{totalTrips}</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--pb-surface)',
            padding: '1.1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--pb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Active in Transit</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB' }}>{inTransitCount} Vans</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--pb-surface)',
            padding: '1.1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--pb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Delivered Successfully</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>{completedCount} Trips</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--pb-surface)',
            padding: '1.1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--pb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#FDF2F8',
              color: '#DB2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Stems Dispatched</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>{totalStemsMoved.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--pb-surface)',
          padding: '0.85rem 1.15rem',
          borderRadius: '12px',
          border: '1px solid var(--pb-border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.85rem',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--pb-blush)', borderRadius: '8px', padding: '0.45rem 0.75rem', width: '320px' }}>
          <Search size={16} color="var(--pb-text-muted)" />
          <input
            type="text"
            placeholder="Search driver, route, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', color: 'var(--pb-plum)' }}
          />
          {search && <X size={14} style={{ cursor: 'pointer', color: 'var(--pb-text-muted)' }} onClick={() => setSearch('')} />}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: statusFilter === st ? '1.5px solid var(--pb-rose)' : '1px solid var(--pb-border)',
                background: statusFilter === st ? 'var(--pb-blush)' : 'var(--pb-surface)',
                color: statusFilter === st ? 'var(--pb-rose)' : 'var(--pb-text-body)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {st === 'ALL' ? 'All Deliveries' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Deliveries Table ────────────────────────────────────── */}
      <div style={{ background: 'var(--pb-surface)', borderRadius: '14px', border: '1px solid var(--pb-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: 'var(--pb-blush)', borderBottom: '1px solid var(--pb-border)', color: 'var(--pb-plum)' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Delivery Trip</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Vehicle & Driver</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Route & Destination</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Cargo & Temp</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Departure & ETA</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((del) => {
              const statusColors = {
                SCHEDULED: { bg: '#FEF3C7', color: '#B45309', label: 'Scheduled' },
                IN_TRANSIT: { bg: '#EFF6FF', color: '#1D4ED8', label: 'In Transit' },
                DELIVERED: { bg: '#DCFCE7', color: '#15803D', label: 'Delivered' }
              };
              const badge = statusColors[del.status] || statusColors.SCHEDULED;

              return (
                <tr key={del.id} style={{ borderBottom: '1px solid var(--pb-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                    {del.id}
                    <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>Order: {del.orderId}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--pb-plum)' }}>{del.driver}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--pb-text-muted)' }}>{del.van}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--pb-text-body)' }}>{del.destination}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>🛣️ {del.route}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--pb-rose)' }}>{del.stems} stems</div>
                    <div style={{ fontSize: '0.72rem', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ThermometerSnowflake size={12} /> {del.temperature}
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--pb-text-body)' }}>
                    <div>Dep: {del.departureTime}</div>
                    <div style={{ color: 'var(--pb-text-muted)' }}>ETA: {del.estimatedArrival}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {del.status === 'IN_TRANSIT' ? (
                      <button
                        type="button"
                        onClick={() => handleMarkComplete(del)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: '#DCFCE7',
                          border: '1px solid #BBF7D0',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: '#15803D',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Mark Delivered
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>
                        {del.status === 'DELIVERED' ? '✓ Completed' : 'Waiting Dispatch'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Schedule Delivery Modal ─────────────────────────────── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--pb-surface)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '440px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid var(--pb-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={22} color="var(--pb-rose)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                  Schedule Delivery Trip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pb-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Destination & Client *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cinnamon Grand Hotel, Colombo 03"
                  value={newForm.destination}
                  onChange={(e) => setNewForm({ ...newForm, destination: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Vehicle *
                  </label>
                  <select
                    value={newForm.van}
                    onChange={(e) => setNewForm({ ...newForm, van: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  >
                    <option value="Van #PB-04 (Chilled 4°C)">Van #PB-04 (Chilled)</option>
                    <option value="Van #PB-02 (Insulated)">Van #PB-02 (Insulated)</option>
                    <option value="Van #PB-01 (Express)">Van #PB-01 (Express)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Driver *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.driver}
                    onChange={(e) => setNewForm({ ...newForm, driver: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Total Stems *
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={newForm.stems}
                    onChange={(e) => setNewForm({ ...newForm, stems: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Departure Time *
                  </label>
                  <input
                    type="text"
                    placeholder="07:00 AM"
                    value={newForm.departureTime}
                    onChange={(e) => setNewForm({ ...newForm, departureTime: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ flex: 1 }}>
                  Schedule Trip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
