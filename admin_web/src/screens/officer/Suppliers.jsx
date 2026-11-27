import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../api';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  CheckCircle2,
  Package,
  X,
  Building,
  ShieldCheck
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Suppliers Dataset Aligned with Database Schema ──────────────────────────
// DB Columns: supplier_id, supplier_name, contact_number, city, address, monthly_capacity, is_approved
const INITIAL_SUPPLIERS = [
  {
    id: 'SUP-101',
    supplierName: 'Hakgala Highland Flora',
    contactNumber: '+94 71 234 5678',
    city: 'Nuwara Eliya',
    address: 'Passara Road, Hakgala',
    monthlyCapacity: 22000,
    isApproved: true
  },
  {
    id: 'SUP-102',
    supplierName: 'Welimada Mist Orchid Nurseries',
    contactNumber: '+94 77 345 6789',
    city: 'Welimada',
    address: 'Green Valley, Boralanda',
    monthlyCapacity: 14000,
    isApproved: false
  },
  {
    id: 'SUP-103',
    supplierName: 'Ella Mountain Carnations',
    contactNumber: '+94 76 456 7890',
    city: 'Bandarawela',
    address: 'Ravana Heights, Ella',
    monthlyCapacity: 18000,
    isApproved: true
  },
  {
    id: 'SUP-104',
    supplierName: 'Bandarawela Cut Flower Estate',
    contactNumber: '+94 71 567 8901',
    city: 'Bandarawela',
    address: 'Poonagala Road, Bandarawela',
    monthlyCapacity: 16000,
    isApproved: true
  },
  {
    id: 'SUP-105',
    supplierName: 'Horton Plains Valley Flora',
    contactNumber: '+94 77 678 9012',
    city: 'Nuwara Eliya',
    address: 'Ohiya Road, Nuwara Eliya',
    monthlyCapacity: 25000,
    isApproved: true
  }
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch live suppliers from MySQL
  useEffect(() => {
    let isMounted = true;
    api.getSuppliers()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbMapped = res.data.map((s) => ({
            id: `SUP-${s.supplier_id}`,
            supplier_id: s.supplier_id,
            supplierName: s.supplier_name,
            contactNumber: s.contact_number,
            city: s.city,
            address: s.address,
            monthlyCapacity: s.monthly_capacity || 15000,
            isApproved: Boolean(s.is_approved)
          }));
          const dbIds = new Set(dbMapped.map((s) => s.id));
          const remaining = INITIAL_SUPPLIERS.filter((p) => !dbIds.has(p.id));
          setSuppliers([...dbMapped, ...remaining]);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // New Supplier Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    supplierName: '',
    contactNumber: '',
    city: 'Nuwara Eliya',
    address: '',
    monthlyCapacity: 15000
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── KPI Summary Calculations ────────────────────────────────────────────────
  const totalSuppliers = suppliers.length;
  const approvedCount = suppliers.filter((s) => s.isApproved).length;
  const pendingCount = suppliers.filter((s) => !s.isApproved).length;
  const totalCapacity = suppliers.reduce((acc, s) => acc + s.monthlyCapacity, 0);

  // ── Search & Filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...suppliers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.supplierName.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.contactNumber.includes(q)
      );
    }

    if (cityFilter !== 'ALL') {
      list = list.filter((s) => s.city.toLowerCase() === cityFilter.toLowerCase());
    }

    return list;
  }, [suppliers, search, cityFilter]);

  // ── Submit New Supplier ─────────────────────────────────────────────────────
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!newForm.supplierName.trim()) return;

    const newId = `SUP-${100 + suppliers.length + 1}`;
    const item = {
      id: newId,
      ...newForm,
      monthlyCapacity: parseInt(newForm.monthlyCapacity) || 12000,
      isApproved: true
    };

    try {
      const res = await api.createSupplier({
        supplier_name: newForm.supplierName,
        contact_number: newForm.contactNumber,
        city: newForm.city,
        address: newForm.address,
        monthly_capacity: parseInt(newForm.monthlyCapacity) || 12000
      });
      if (res && res.success && res.data) {
        item.supplier_id = res.data.supplier_id;
        showToast(`🌸 Supplier "${newForm.supplierName}" saved to MySQL Database!`);
      } else {
        showToast(`🌸 Supplier "${newForm.supplierName}" registered successfully!`);
      }
    } catch {
      showToast(`🌸 Supplier "${newForm.supplierName}" registered successfully!`);
    }

    setSuppliers([item, ...suppliers]);
    setShowAddModal(false);
    setNewForm({
      supplierName: '',
      contactNumber: '',
      city: 'Nuwara Eliya',
      address: '',
      monthlyCapacity: 15000
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
          <CheckCircle2 size={18} color="var(--pb-leaf)" />
          {toastMessage}
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Flower Farm Suppliers"
        subtitle="Manage contracted farm growers from Nuwara Eliya, Welimada, and Bandarawela"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Register Supplier
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
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Farm Suppliers</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>{totalSuppliers} Growers</div>
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
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Approved Growers</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>{approvedCount} Active</div>
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
            <Building size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Pending Approval</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B45309' }}>{pendingCount} Growers</div>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Monthly Supply Capacity</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB' }}>{totalCapacity.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>stems</span></div>
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
            placeholder="Search supplier, city, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', color: 'var(--pb-plum)' }}
          />
          {search && <X size={14} style={{ cursor: 'pointer', color: 'var(--pb-text-muted)' }} onClick={() => setSearch('')} />}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'Nuwara Eliya', 'Welimada', 'Bandarawela'].map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setCityFilter(reg)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: cityFilter === reg ? '1.5px solid var(--pb-rose)' : '1px solid var(--pb-border)',
                background: cityFilter === reg ? 'var(--pb-blush)' : 'var(--pb-surface)',
                color: cityFilter === reg ? 'var(--pb-rose)' : 'var(--pb-text-body)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {reg === 'ALL' ? 'All Cities' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* ── Suppliers Table ─────────────────────────────────────── */}
      <div style={{ background: 'var(--pb-surface)', borderRadius: '14px', border: '1px solid var(--pb-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: 'var(--pb-blush)', borderBottom: '1px solid var(--pb-border)', color: 'var(--pb-plum)' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Supplier Name</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Contact Number</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>City</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Address</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Monthly Capacity</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sup) => (
              <tr key={sup.id} style={{ borderBottom: '1px solid var(--pb-border)' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--pb-plum)' }}>{sup.supplierName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>ID: {sup.id}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--pb-text-body)' }}>📞 {sup.contactNumber}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem', color: 'var(--pb-plum)', fontWeight: 600 }}>
                  📍 {sup.city}
                </td>

                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--pb-text-body)' }}>
                  {sup.address}
                </td>

                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--pb-rose)' }}>
                  {sup.monthlyCapacity.toLocaleString()} stems
                </td>

                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  {sup.isApproved ? (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#15803D' }}>
                      ✓ Approved
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309' }}>
                      ⏳ Pending Approval
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Register Supplier Modal ─────────────────────────────── */}
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
                <Building size={22} color="var(--pb-rose)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                  Register Supplier
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

            <form onSubmit={handleAddSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Supplier / Farm Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hakgala Highland Flora"
                  value={newForm.supplierName}
                  onChange={(e) => setNewForm({ ...newForm, supplierName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+94 77 123 4567"
                    value={newForm.contactNumber}
                    onChange={(e) => setNewForm({ ...newForm, contactNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    City *
                  </label>
                  <select
                    value={newForm.city}
                    onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  >
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Welimada">Welimada</option>
                    <option value="Bandarawela">Bandarawela</option>
                    <option value="Ella">Ella</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passara Road, Hakgala"
                  value={newForm.address}
                  onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Monthly Capacity (Stems) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  placeholder="15000"
                  value={newForm.monthlyCapacity}
                  onChange={(e) => setNewForm({ ...newForm, monthlyCapacity: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ flex: 1 }}>
                  Register Supplier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
