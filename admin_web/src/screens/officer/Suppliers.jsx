import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Package,
  X,
  Building,
  Award,
  Flower2
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Clean Highland Farm Suppliers Dataset ────────────────────────────────────
const INITIAL_SUPPLIERS = [
  {
    id: 'SUP-101',
    name: 'Hakgala Highland Flora',
    owner: 'Manjula Rajapaksha',
    region: 'Nuwara Eliya',
    phone: '+94 71 234 5678',
    email: 'manjula@hakgalaflora.lk',
    flowers: 'Red Naomi Rose, Casablanca Lily',
    monthlyCapacity: 22000,
    status: 'ACTIVE',
    rating: 4.9
  },
  {
    id: 'SUP-102',
    name: 'Welimada Mist Orchid Nurseries',
    owner: 'Gamini Disanayake',
    region: 'Welimada',
    phone: '+94 77 345 6789',
    email: 'orchids@welimadaflora.lk',
    flowers: 'Dendrobium Orchid, Tropical Anthurium',
    monthlyCapacity: 14000,
    status: 'ACTIVE',
    rating: 4.8
  },
  {
    id: 'SUP-103',
    name: 'Ella Mountain Carnations',
    owner: 'Sunethra Wickramasinghe',
    region: 'Ella / Bandarawela',
    phone: '+94 76 456 7890',
    email: 'sunethra@ellaflowers.lk',
    flowers: 'Standard Pink Carnation, Gerbera Daisies',
    monthlyCapacity: 18000,
    status: 'ACTIVE',
    rating: 4.7
  },
  {
    id: 'SUP-104',
    name: 'Bandarawela Cut Flower Estate',
    owner: 'Priyantha Bandara',
    region: 'Bandarawela',
    phone: '+94 71 567 8901',
    email: 'priyantha@bandarawelaflora.lk',
    flowers: 'Golden Chrysanthemum, Lavender Lisianthus',
    monthlyCapacity: 16000,
    status: 'ACTIVE',
    rating: 4.9
  },
  {
    id: 'SUP-105',
    name: 'Horton Plains Valley Statice & Fillers',
    owner: 'Ranjith Silva',
    region: 'Ohiya / Nuwara Eliya',
    phone: '+94 77 678 9012',
    email: 'ranjith@hortonflora.lk',
    flowers: 'Blue Sea Lavender, Bridal Baby Breath',
    monthlyCapacity: 25000,
    status: 'ACTIVE',
    rating: 4.8
  }
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // New Supplier Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    owner: '',
    region: 'Nuwara Eliya',
    phone: '',
    email: '',
    flowers: 'Roses, Lilies',
    monthlyCapacity: 15000
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── KPI Summary Calculations ────────────────────────────────────────────────
  const totalSuppliers = suppliers.length;
  const totalCapacity = suppliers.reduce((acc, s) => acc + s.monthlyCapacity, 0);
  const avgRating = (suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length).toFixed(1);

  // ── Search & Filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...suppliers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.owner.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q) ||
          s.flowers.toLowerCase().includes(q)
      );
    }

    if (regionFilter !== 'ALL') {
      list = list.filter((s) => s.region.toLowerCase().includes(regionFilter.toLowerCase()));
    }

    return list;
  }, [suppliers, search, regionFilter]);

  // ── Submit New Supplier ─────────────────────────────────────────────────────
  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    const newId = `SUP-${100 + suppliers.length + 1}`;
    const item = {
      id: newId,
      ...newForm,
      monthlyCapacity: parseInt(newForm.monthlyCapacity) || 12000,
      status: 'ACTIVE',
      rating: 4.8
    };

    setSuppliers([item, ...suppliers]);
    setShowAddModal(false);
    showToast(`🌸 Supplier "${newForm.name}" registered successfully!`);
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
        title="Highland Flower Suppliers"
        subtitle="Manage contracted cut-flower farm growers from Nuwara Eliya, Welimada, and Bandarawela"
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Contracted Farm Suppliers</div>
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
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Monthly Supply Capacity</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>{totalCapacity.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>stems</span></div>
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
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Average Quality Rating</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>{avgRating} ★</div>
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
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Cultivation Zones</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>3 Highland Zones</div>
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
            placeholder="Search farm name, owner, flowers..."
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
              onClick={() => setRegionFilter(reg)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: regionFilter === reg ? '1.5px solid var(--pb-rose)' : '1px solid var(--pb-border)',
                background: regionFilter === reg ? 'var(--pb-blush)' : 'var(--pb-surface)',
                color: regionFilter === reg ? 'var(--pb-rose)' : 'var(--pb-text-body)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {reg === 'ALL' ? 'All Regions' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* ── Suppliers Table ─────────────────────────────────────── */}
      <div style={{ background: 'var(--pb-surface)', borderRadius: '14px', border: '1px solid var(--pb-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: 'var(--pb-blush)', borderBottom: '1px solid var(--pb-border)', color: 'var(--pb-plum)' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Supplier & Farm</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Contact Person</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Cultivation Region</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Supplied Flower Varieties</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Monthly Stems</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Rating</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sup) => (
              <tr key={sup.id} style={{ borderBottom: '1px solid var(--pb-border)' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--pb-plum)' }}>{sup.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>ID: {sup.id}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--pb-text-body)' }}>{sup.owner}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--pb-text-muted)' }}>📞 {sup.phone}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem', color: 'var(--pb-plum)', fontWeight: 600 }}>
                  📍 {sup.region}
                </td>

                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--pb-text-body)' }}>
                  🌸 {sup.flowers}
                </td>

                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--pb-rose)' }}>
                  {sup.monthlyCapacity.toLocaleString()} stems
                </td>

                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#D97706' }}>
                  {sup.rating} ★
                </td>

                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#15803D' }}>
                    ✓ Active Supplier
                  </span>
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
                  Register Flower Supplier
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
                  Farm / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hakgala Flora Nursery"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Grower Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manjula Rajapaksha"
                    value={newForm.owner}
                    onChange={(e) => setNewForm({ ...newForm, owner: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Cultivation Region *
                  </label>
                  <select
                    value={newForm.region}
                    onChange={(e) => setNewForm({ ...newForm, region: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  >
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Welimada">Welimada</option>
                    <option value="Bandarawela">Bandarawela</option>
                    <option value="Hakgala">Hakgala</option>
                    <option value="Ella">Ella</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+94 77 123 4567"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Monthly Capacity *
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Supplied Flower Varieties *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Roses, Lilies, Carnations"
                  value={newForm.flowers}
                  onChange={(e) => setNewForm({ ...newForm, flowers: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ flex: 1 }}>
                  Register Grower
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
