import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Download,
  X,
  Printer,
  Calendar,
  Building
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Clean Invoices Dataset ───────────────────────────────────────────────────
const INITIAL_INVOICES = [
  {
    id: 'INV-5501',
    orderId: 'ORD-8841',
    customer: 'Kingsbury Hotel Banquet Events',
    flowers: 'Red Naomi Rose (300 stems)',
    subtotal: 105000,
    status: 'PAID',
    invoiceDate: '2026-11-04',
    dueDate: '2026-11-18',
    paymentMethod: 'Bank Transfer (Commercial Bank)'
  },
  {
    id: 'INV-5500',
    orderId: 'ORD-8840',
    customer: 'Lassana Petals Floral Studio',
    flowers: 'Dendrobium Orchid (200 stems)',
    subtotal: 84000,
    status: 'PAID',
    invoiceDate: '2026-11-03',
    dueDate: '2026-11-17',
    paymentMethod: 'Corporate Credit (14-Day)'
  },
  {
    id: 'INV-5499',
    orderId: 'ORD-8839',
    customer: 'Shangri-La Colombo Florist',
    flowers: 'Casablanca White Lily (150 stems)',
    subtotal: 72000,
    status: 'PAID',
    invoiceDate: '2026-11-03',
    dueDate: '2026-11-17',
    paymentMethod: 'Direct Debit (HNB)'
  },
  {
    id: 'INV-5498',
    orderId: 'ORD-8838',
    customer: 'Cinnamon Grand Wedding Events',
    flowers: 'Tropical Anthurium (300 stems)',
    subtotal: 96000,
    status: 'UNPAID',
    invoiceDate: '2026-11-04',
    dueDate: '2026-11-18',
    paymentMethod: 'Pending Payment'
  },
  {
    id: 'INV-5497',
    orderId: 'ORD-8837',
    customer: 'Galle Face Hotel Ballroom',
    flowers: 'Bridal Baby Breath (250 stems)',
    subtotal: 57500,
    status: 'PAID',
    invoiceDate: '2026-11-02',
    dueDate: '2026-11-16',
    paymentMethod: 'Bank Transfer (BOC)'
  }
];

export default function Invoices() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // New Invoice Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    orderId: 'ORD-8842',
    customer: '',
    flowers: 'Roses & Lilies',
    subtotal: 75000,
    dueDate: '2026-11-20'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── KPI Summary ─────────────────────────────────────────────────────────────
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.subtotal, 0);
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;
  const unpaidCount = invoices.filter((inv) => inv.status === 'UNPAID').length;
  const pendingReceivables = invoices
    .filter((inv) => inv.status === 'UNPAID')
    .reduce((acc, inv) => acc + inv.subtotal, 0);

  // ── Search & Filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...invoices];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.id.toLowerCase().includes(q) ||
          inv.customer.toLowerCase().includes(q) ||
          inv.orderId.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((inv) => inv.status === statusFilter);
    }

    return list;
  }, [invoices, search, statusFilter]);

  // ── Mark Paid Action ────────────────────────────────────────────────────────
  const handleMarkPaid = (inv) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === inv.id ? { ...i, status: 'PAID', paymentMethod: 'Bank Transfer' } : i
      )
    );
    showToast(`Invoice #${inv.id} marked as Paid!`);
  };

  // ── Create Invoice ──────────────────────────────────────────────────────────
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newForm.customer.trim()) return;

    const newId = `INV-${5500 + invoices.length + 1}`;
    const item = {
      id: newId,
      ...newForm,
      subtotal: parseFloat(newForm.subtotal) || 50000,
      status: 'UNPAID',
      invoiceDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Pending Payment'
    };

    setInvoices([item, ...invoices]);
    setShowAddModal(false);
    showToast(`🧾 Invoice #${newId} generated successfully!`);
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
        title="Commercial Invoices & Billing"
        subtitle="Generate and track wholesale billing records for hotel and floral clients"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Create Invoice
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
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Invoices Issued</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>{invoices.length}</div>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Paid Invoices</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>{paidCount} Settled</div>
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
              background: unpaidCount > 0 ? '#FEF3C7' : '#DCFCE7',
              color: unpaidCount > 0 ? '#B45309' : '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Outstanding Invoices</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: unpaidCount > 0 ? '#B45309' : '#15803D' }}>{unpaidCount} Pending</div>
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
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Billed Revenue</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
              Rs. {(totalInvoiced / 1000).toFixed(0)}k
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter ─────────────────────────────────────── */}
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
            placeholder="Search invoice #, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', color: 'var(--pb-plum)' }}
          />
          {search && <X size={14} style={{ cursor: 'pointer', color: 'var(--pb-text-muted)' }} onClick={() => setSearch('')} />}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'PAID', 'UNPAID'].map((st) => (
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
              {st === 'ALL' ? 'All Invoices' : st === 'PAID' ? 'Settled (Paid)' : 'Pending (Unpaid)'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Invoices Table ──────────────────────────────────────── */}
      <div style={{ background: 'var(--pb-surface)', borderRadius: '14px', border: '1px solid var(--pb-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: 'var(--pb-blush)', borderBottom: '1px solid var(--pb-border)', color: 'var(--pb-plum)' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Invoice Number</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Billed Client</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Billed Items</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Issue & Due Date</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Amount</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Payment Method</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--pb-border)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                  {inv.id}
                  <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>Order: {inv.orderId}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--pb-plum)' }}>{inv.customer}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--pb-text-body)' }}>
                  🌸 {inv.flowers}
                </td>

                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--pb-text-body)' }}>
                  <div>Issued: {inv.invoiceDate}</div>
                  <div style={{ color: 'var(--pb-text-muted)' }}>Due: {inv.dueDate}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--pb-rose)' }}>
                  Rs. {inv.subtotal.toLocaleString()}
                </td>

                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--pb-text-muted)' }}>
                  {inv.paymentMethod}
                </td>

                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  {inv.status === 'PAID' ? (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#15803D' }}>
                      ✓ Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(inv)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        background: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#B45309',
                        cursor: 'pointer'
                      }}
                    >
                      Mark as Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Create Invoice Modal ─────────────────────────────────── */}
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
                <FileText size={22} color="var(--pb-rose)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                  Generate New Invoice
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

            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Billed Client / Hotel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cinnamon Grand Colombo"
                  value={newForm.customer}
                  onChange={(e) => setNewForm({ ...newForm, customer: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Order Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.orderId}
                    onChange={(e) => setNewForm({ ...newForm, orderId: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Total Billed Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={newForm.subtotal}
                    onChange={(e) => setNewForm({ ...newForm, subtotal: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Items Billed *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Red Naomi Roses (300 stems)"
                  value={newForm.flowers}
                  onChange={(e) => setNewForm({ ...newForm, flowers: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Payment Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={newForm.dueDate}
                  onChange={(e) => setNewForm({ ...newForm, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ flex: 1 }}>
                  Issue Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
