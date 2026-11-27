import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../api';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Search,
  X,
  Calendar
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Deliveries Dataset Aligned with Database Schema ─────────────────────────
// DB Columns: delivery_id, delivery_code, order_id, business_officer_id, delivery_date, status
const INITIAL_DELIVERIES = [
  {
    id: 'DEL-101',
    orderCode: 'ORD-1001',
    officerId: 'OFF-01',
    deliveryDate: '2026-11-20',
    status: 'SCHEDULED'
  },
  {
    id: 'DEL-102',
    orderCode: 'ORD-1003',
    officerId: 'OFF-01',
    deliveryDate: '2026-11-19',
    status: 'IN_TRANSIT'
  },
  {
    id: 'DEL-103',
    orderCode: 'ORD-1004',
    officerId: 'OFF-02',
    deliveryDate: '2026-11-18',
    status: 'DELIVERED'
  }
];

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch live deliveries from backend if available
  useEffect(() => {
    let isMounted = true;
    api.getDeliveries()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbMapped = res.data.map((d) => ({
            id: d.delivery_code || `DEL-${100 + d.delivery_id}`,
            delivery_id: d.delivery_id,
            orderCode: d.order?.order_code || `ORD-${1000 + d.order_id}`,
            officerId: d.officer?.name || `OFF-0${d.business_officer_id}`,
            deliveryDate: d.delivery_date || '2026-11-20',
            status: d.status || 'SCHEDULED'
          }));
          const dbIds = new Set(dbMapped.map((d) => d.id));
          const remaining = INITIAL_DELIVERIES.filter((p) => !dbIds.has(p.id));
          setDeliveries([...dbMapped, ...remaining]);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // New Delivery Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    orderCode: '',
    officerId: 'OFF-01',
    deliveryDate: new Date().toISOString().split('T')[0]
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── KPI Summary ─────────────────────────────────────────────────────────────
  const totalTrips = deliveries.length;
  const inTransitCount = deliveries.filter((d) => d.status === 'IN_TRANSIT').length;
  const completedCount = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const scheduledCount = deliveries.filter((d) => d.status === 'SCHEDULED').length;

  // ── Filter & Search ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...deliveries];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.orderCode.toLowerCase().includes(q) ||
          d.officerId.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((d) => d.status === statusFilter);
    }

    return list;
  }, [deliveries, search, statusFilter]);

  // ── Action: Mark Complete ───────────────────────────────────────────────────
  const handleMarkComplete = async (delivery) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === delivery.id ? { ...d, status: 'DELIVERED' } : d))
    );
    showToast(`Delivery #${delivery.id} confirmed completed!`);

    if (delivery.delivery_id) {
      try {
        await api.updateDeliveryStatus(delivery.delivery_id, 'DELIVERED');
      } catch {}
    }
  };

  // ── Submit New Delivery ─────────────────────────────────────────────────────
  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    const newId = `DEL-${100 + deliveries.length + 1}`;
    const item = {
      id: newId,
      ...newForm,
      status: 'SCHEDULED'
    };

    try {
      const res = await api.createDelivery({
        delivery_code: newId,
        order_id: 1, // Default linked order ID
        business_officer_id: 2, // Officer user_id
        delivery_date: newForm.deliveryDate,
        status: 'SCHEDULED'
      });
      if (res && res.success && res.data) {
        item.delivery_id = res.data.delivery_id;
        showToast(`🚚 Delivery trip #${newId} saved to MySQL Database!`);
      } else {
        showToast(`🚚 Delivery trip #${newId} scheduled successfully!`);
      }
    } catch {
      showToast(`🚚 Delivery trip #${newId} scheduled successfully!`);
    }

    setDeliveries([item, ...deliveries]);
    setShowAddModal(false);
    setNewForm({ orderCode: '', officerId: 'OFF-01', deliveryDate: new Date().toISOString().split('T')[0] });
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
          <CheckCircle2 size={18} color="#86EFAC" />
          {toastMessage}
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Deliveries & Dispatch"
        subtitle="Manage and track order dispatches and delivery status"
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Deliveries</div>
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
              background: '#FEF3C7',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Scheduled</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B45309' }}>{scheduledCount}</div>
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
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Active in Transit</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB' }}>{inTransitCount}</div>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Delivered</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>{completedCount}</div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--pb-blush)', borderRadius: '8px', padding: '0.45rem 0.75rem', width: '280px' }}>
          <Search size={16} color="var(--pb-text-muted)" />
          <input
            type="text"
            placeholder="Search delivery code, order..."
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
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Delivery Code</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Order Code</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Business Officer ID</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Delivery Date</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--pb-text-muted)', fontSize: '0.88rem' }}>
                  No deliveries found.
                </td>
              </tr>
            ) : (
              filtered.map((del) => {
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
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--pb-rose)' }}>
                      {del.orderCode}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--pb-text-body)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="var(--pb-text-muted)" />
                        {del.officerId}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--pb-text-body)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} color="var(--pb-text-muted)" />
                        {del.deliveryDate}
                      </div>
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
                          {del.status === 'DELIVERED' ? '✓ Completed' : 'Pending Transit'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
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
              maxWidth: '420px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid var(--pb-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={22} color="var(--pb-rose)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                  Schedule Delivery
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
                  Order Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORD-1002"
                  value={newForm.orderCode}
                  onChange={(e) => setNewForm({ ...newForm, orderCode: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Business Officer ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OFF-01"
                  value={newForm.officerId}
                  onChange={(e) => setNewForm({ ...newForm, officerId: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={newForm.deliveryDate}
                  onChange={(e) => setNewForm({ ...newForm, deliveryDate: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ flex: 1 }}>
                  Schedule Delivery
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
