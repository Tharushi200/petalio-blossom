import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../api';
import {
  FileText,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  X,
  Calendar,
  Receipt
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Clean Invoices Dataset Aligned with Database Schema ─────────────────────
// DB Columns: invoice_id, order_id, total_amount, tax_amount, date, status
const INITIAL_INVOICES = [
  {
    invoiceId: 1,
    orderId: 1001,
    totalAmount: 105000,
    taxAmount: 5250,
    date: '2026-11-04',
    status: 'PAID'
  },
  {
    invoiceId: 2,
    orderId: 1002,
    totalAmount: 84000,
    taxAmount: 4200,
    date: '2026-11-03',
    status: 'PAID'
  },
  {
    invoiceId: 3,
    orderId: 1003,
    totalAmount: 72000,
    taxAmount: 3600,
    date: '2026-11-03',
    status: 'PAID'
  },
  {
    invoiceId: 4,
    orderId: 1004,
    totalAmount: 96000,
    taxAmount: 4800,
    date: '2026-11-04',
    status: 'UNPAID'
  },
  {
    invoiceId: 5,
    orderId: 1005,
    totalAmount: 57500,
    taxAmount: 2875,
    date: '2026-11-02',
    status: 'PAID'
  }
];

export default function Invoices() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch live invoices from backend
  useEffect(() => {
    let isMounted = true;
    api.getInvoices()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbMapped = res.data.map((inv) => ({
            invoiceId: inv.invoice_id,
            orderId: inv.order_id,
            totalAmount: parseFloat(inv.total_amount) || 0,
            taxAmount: parseFloat(inv.tax_amount) || 0,
            date: inv.date || '2026-11-04',
            status: inv.status || 'UNPAID'
          }));
          const dbIds = new Set(dbMapped.map((d) => d.invoiceId));
          const remaining = INITIAL_INVOICES.filter((p) => !dbIds.has(p.invoiceId));
          setInvoices([...dbMapped, ...remaining]);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // New Invoice Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    orderId: '',
    totalAmount: '',
    taxAmount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── KPI Summary ─────────────────────────────────────────────────────────────
  const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;
  const unpaidCount = invoices.filter((inv) => inv.status === 'UNPAID').length;
  const pendingReceivables = invoices
    .filter((inv) => inv.status === 'UNPAID')
    .reduce((acc, inv) => acc + Number(inv.totalAmount), 0);

  // ── Search & Filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...invoices];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (inv) =>
          String(inv.invoiceId).includes(q) ||
          String(inv.orderId).includes(q) ||
          inv.date.includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((inv) => inv.status === statusFilter);
    }

    return list;
  }, [invoices, search, statusFilter]);

  // ── Mark Paid Action ────────────────────────────────────────────────────────
  const handleMarkPaid = async (inv) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.invoiceId === inv.invoiceId ? { ...i, status: 'PAID' } : i
      )
    );
    showToast(`Invoice #${inv.invoiceId} marked as Paid!`);

    if (inv.invoiceId) {
      try {
        await api.updateInvoiceStatus(inv.invoiceId, 'PAID');
      } catch {}
    }
  };

  // ── Create Invoice ──────────────────────────────────────────────────────────
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newForm.orderId || !newForm.totalAmount) return;

    const newId = Math.max(...invoices.map((i) => i.invoiceId), 0) + 1;
    const item = {
      invoiceId: newId,
      orderId: Number(newForm.orderId),
      totalAmount: parseFloat(newForm.totalAmount) || 0,
      taxAmount: parseFloat(newForm.taxAmount) || 0,
      date: newForm.date || new Date().toISOString().split('T')[0],
      status: 'UNPAID'
    };

    try {
      const res = await api.createInvoice({
        order_id: Number(newForm.orderId) || 1,
        total_amount: parseFloat(newForm.totalAmount) || 0,
        tax_amount: parseFloat(newForm.taxAmount) || 0,
        date: newForm.date || new Date().toISOString().split('T')[0],
        status: 'UNPAID'
      });
      if (res && res.success && res.data) {
        item.invoiceId = res.data.invoice_id;
        showToast(`📄 Invoice #${item.invoiceId} saved to MySQL Database!`);
      } else {
        showToast(`🧾 Invoice #${newId} generated successfully!`);
      }
    } catch {
      showToast(`🧾 Invoice #${newId} generated successfully!`);
    }

    setInvoices([item, ...invoices]);
    setShowAddModal(false);
    setNewForm({
      orderId: '',
      totalAmount: '',
      taxAmount: '',
      date: new Date().toISOString().split('T')[0]
    });
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
        title="Commercial Invoices"
        subtitle="Manage and track billing invoices generated for customer orders"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Create Invoice
          </Button>
        }
      />

      {/* ── 4 KPI Summary Cards ─────────────────────────────────── */}
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Invoices</div>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Unpaid Invoices</div>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Billed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
              Rs. {(totalBilled / 1000).toFixed(0)}k
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--pb-blush)', borderRadius: '8px', padding: '0.45rem 0.75rem', width: '300px' }}>
          <Search size={16} color="var(--pb-text-muted)" />
          <input
            type="text"
            placeholder="Search invoice ID, order ID, date..."
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
              {st === 'ALL' ? 'All Invoices' : st === 'PAID' ? 'Paid' : 'Unpaid'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Invoices Table ──────────────────────────────────────── */}
      <div style={{ background: 'var(--pb-surface)', borderRadius: '14px', border: '1px solid var(--pb-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: 'var(--pb-blush)', borderBottom: '1px solid var(--pb-border)', color: 'var(--pb-plum)' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Invoice ID</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Order ID</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Total Amount</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Tax Amount</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Invoice Date</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--pb-text-muted)', fontSize: '0.88rem' }}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.invoiceId} style={{ borderBottom: '1px solid var(--pb-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                    #{inv.invoiceId}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--pb-rose)' }}>
                    ORD-{inv.orderId}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                    Rs. {Number(inv.totalAmount).toLocaleString()}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: 'var(--pb-text-muted)', fontSize: '0.82rem' }}>
                    Rs. {Number(inv.taxAmount).toLocaleString()}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--pb-text-body)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="var(--pb-text-muted)" />
                      {inv.date}
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: inv.status === 'PAID' ? '#DCFCE7' : '#FEF3C7',
                        color: inv.status === 'PAID' ? '#15803D' : '#B45309'
                      }}
                    >
                      {inv.status}
                    </span>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {inv.status === 'PAID' ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>
                        ✓ Settled
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
              ))
            )}
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
              maxWidth: '420px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid var(--pb-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={22} color="var(--pb-rose)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                  Generate Invoice
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
                  Order ID *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1006"
                  value={newForm.orderId}
                  onChange={(e) => setNewForm({ ...newForm, orderId: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Total Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="75000"
                    value={newForm.totalAmount}
                    onChange={(e) => {
                      const total = parseFloat(e.target.value) || 0;
                      setNewForm({
                        ...newForm,
                        totalAmount: e.target.value,
                        taxAmount: (total * 0.05).toFixed(2)
                      });
                    }}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Tax Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    placeholder="3750"
                    value={newForm.taxAmount}
                    onChange={(e) => setNewForm({ ...newForm, taxAmount: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Invoice Date *
                </label>
                <input
                  type="date"
                  required
                  value={newForm.date}
                  onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ flex: 1 }}>
                  Generate Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
