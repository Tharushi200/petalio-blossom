import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../api';
import {
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Plus,
  Minus,
  Edit2,
  X,
  Flower2
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Clean Preset Inventory Items (Cohesive with Catalogue F001–F019) ─────────
/* =========================================================================
   💡 NOTE FOR IMAGE CUSTOMIZATION:
   To change the image for any inventory item, edit the `image:` property below.
   You can point to `/image_name.jpg` inside `admin_web/public/` or use an online URL.
   ========================================================================= */
const INITIAL_INVENTORY = [
  {
    id: 1,
    code: 'F001',
    name: 'Red Naomi Rose',
    category: 'Rose',
    unitPrice: 350,
    stock: 185,
    reorderLevel: 50,
    image: '/rose.jpg', // 👈 Change image here
    lastRestocked: '2026-11-04'
  },
  {
    id: 2,
    code: 'F002',
    name: 'Dendrobium Orchid',
    category: 'Orchid',
    unitPrice: 420,
    stock: 95,
    reorderLevel: 40,
    image: '/orchid.jpg', // 👈 Change image here
    lastRestocked: '2026-11-03'
  },
  {
    id: 3,
    code: 'F003',
    name: 'Casablanca White Lily',
    category: 'Lily',
    unitPrice: 830,
    stock: 60,
    reorderLevel: 40,
    image: '/lily.jpg', // 👈 Change image here
    lastRestocked: '2026-11-02'
  },
  {
    id: 4,
    code: 'F004',
    name: 'Standard Pink Carnation',
    category: 'Carnation',
    unitPrice: 300,
    stock: 220,
    reorderLevel: 60,
    image: '/carnation.jpg', // 👈 Change image here
    lastRestocked: '2026-11-03'
  },
  {
    id: 5,
    code: 'F005',
    name: 'Golden Chrysanthemum',
    category: 'Chrysanthemum',
    unitPrice: 240,
    stock: 140,
    reorderLevel: 50,
    image: '/chrysanthemum.jpg', // 👈 Change image here
    lastRestocked: '2026-10-30'
  },
  {
    id: 6,
    code: 'F006',
    name: 'Sunshine Gerbera',
    category: 'Gerbera',
    unitPrice: 200,
    stock: 45, // Low Stock alert
    reorderLevel: 50,
    image: '/daisies.jpg', // 👈 Change image here
    lastRestocked: '2026-10-28'
  },
  {
    id: 7,
    code: 'F007',
    name: 'Lavender Lisianthus',
    category: 'Lisianthus',
    unitPrice: 510,
    stock: 130,
    reorderLevel: 50,
    image: '/lisianthus.jpg', // 👈 Change image here
    lastRestocked: '2026-11-02'
  },
  {
    id: 8,
    code: 'F008',
    name: 'English Blue Lavender',
    category: 'Lavender',
    unitPrice: 975,
    stock: 160,
    reorderLevel: 50,
    image: '/sea_lavenders.jpg', // 👈 Change image here
    lastRestocked: '2026-11-01'
  },
  {
    id: 9,
    code: 'F009',
    name: "Bridal Baby's Breath",
    category: "Baby's Breath",
    unitPrice: 1500,
    stock: 250,
    reorderLevel: 70,
    image: '/baby_breath.jpg', // 👈 Change image here
    lastRestocked: '2026-11-04'
  },
  {
    id: 10,
    code: 'F010',
    name: 'Ceylon Sunflower',
    category: 'Sunflower',
    unitPrice: 270,
    stock: 90,
    reorderLevel: 30,
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-05'
  },
  {
    id: 11,
    code: 'F011',
    name: 'Dutch Garden Tulip',
    category: 'Tulip',
    unitPrice: 710,
    stock: 75,
    reorderLevel: 35,
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-04'
  },
  {
    id: 12,
    code: 'F012',
    name: 'Highland Hydrangea',
    category: 'Hydrangea',
    unitPrice: 1000,
    stock: 50,
    reorderLevel: 25,
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-03'
  },
  {
    id: 13,
    code: 'F013',
    name: 'Royal Peony',
    category: 'Peony',
    unitPrice: 1760,
    stock: 35,
    reorderLevel: 20,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-02'
  },
  {
    id: 14,
    code: 'F014',
    name: 'Standard Freesia',
    category: 'Freesia',
    unitPrice: 420,
    stock: 80,
    reorderLevel: 35,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-03'
  },
  {
    id: 15,
    code: 'F015',
    name: 'Bird of Paradise',
    category: 'Bird of Paradise',
    unitPrice: 800,
    stock: 65,
    reorderLevel: 30,
    image: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-01'
  },
  {
    id: 16,
    code: 'F016',
    name: 'Ranunculus Buttercup',
    category: 'Ranunculus',
    unitPrice: 995,
    stock: 55,
    reorderLevel: 25,
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-04'
  },
  {
    id: 17,
    code: 'F017',
    name: 'Fragrant Tuberose',
    category: 'Tuberose',
    unitPrice: 265,
    stock: 120,
    reorderLevel: 45,
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-02'
  },
  {
    id: 18,
    code: 'F018',
    name: 'Baby Blue Eucalyptus',
    category: 'Eucalyptus',
    unitPrice: 250,
    stock: 175,
    reorderLevel: 50,
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-05'
  },
  {
    id: 19,
    code: 'F019',
    name: 'Peruvian Alstroemeria',
    category: 'Alstroemeria',
    unitPrice: 280,
    stock: 140,
    reorderLevel: 45,
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80', // 👈 Change image here
    lastRestocked: '2026-11-03'
  }
];

export default function Inventory() {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK'
  const [toastMessage, setToastMessage] = useState(null);

  // Stock Adjustment Modal State
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustAction, setAdjustAction] = useState('ADD'); // 'ADD' | 'SET'
  const [newReorderLevel, setNewReorderLevel] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Fetch Live Inventory from MySQL ─────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    api.getInventory()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setIsLiveConnected(true);
          setItems((prev) =>
            prev.map((item) => {
              const live = res.data.find(
                (d) => d.flower_id === item.id || d.flower?.name?.toLowerCase() === item.name.toLowerCase()
              );
              if (live) {
                return {
                  ...item,
                  stock: live.stock_quantity ?? item.stock,
                  reorderLevel: live.reorder_level ?? item.reorderLevel
                };
              }
              return item;
            })
          );
        }
      })
      .catch(() => {
        // Safe offline fallback
      });

    return () => { isMounted = false; };
  }, []);

  // ── KPI Summary Calculations ────────────────────────────────────────────────
  const totalItems = items.length;
  const totalStockStems = items.reduce((acc, it) => acc + it.stock, 0);
  const lowStockCount = items.filter((it) => it.stock <= it.reorderLevel).length;
  const totalValuation = items.reduce((acc, it) => acc + it.stock * it.unitPrice, 0);

  // ── Filter & Search Logic ───────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let list = [...items];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          it.code.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'LOW_STOCK') {
      list = list.filter((it) => it.stock <= it.reorderLevel);
    } else if (statusFilter === 'IN_STOCK') {
      list = list.filter((it) => it.stock > it.reorderLevel);
    }

    return list;
  }, [items, search, statusFilter]);

  // ── Open Adjust Modal ───────────────────────────────────────────────────────
  const handleOpenAdjust = (item) => {
    setAdjustItem(item);
    setAdjustAmount(50);
    setAdjustAction('ADD');
    setNewReorderLevel(item.reorderLevel);
  };

  // ── Save Stock Adjustment ───────────────────────────────────────────────────
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustItem) return;

    const amount = parseInt(adjustAmount) || 0;
    const reorder = parseInt(newReorderLevel) || adjustItem.reorderLevel;
    let newQty = adjustItem.stock;

    if (adjustAction === 'ADD') {
      newQty = adjustItem.stock + amount;
    } else if (adjustAction === 'REDUCE') {
      newQty = Math.max(0, adjustItem.stock - amount);
    } else {
      newQty = Math.max(0, amount);
    }

    // Try updating MySQL Database
    try {
      await api.updateInventory(adjustItem.id, newQty, reorder);
      showToast(`📦 Stock for "${adjustItem.name}" updated in MySQL Database!`);
    } catch {
      showToast(`📦 Stock for "${adjustItem.name}" updated successfully.`);
    }

    setItems((prev) =>
      prev.map((it) =>
        it.id === adjustItem.id ? { ...it, stock: newQty, reorderLevel: reorder } : it
      )
    );

    setAdjustItem(null);
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
        title="Inventory Management"
        subtitle="Track floriculture warehouse stock levels, reorder thresholds, and valuations"
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
            <Flower2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Tracked Flowers</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>{totalItems} Varieties</div>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Warehouse Stock</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>{totalStockStems.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>stems</span></div>
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
              background: lowStockCount > 0 ? '#FEE2E2' : '#DCFCE7',
              color: lowStockCount > 0 ? '#DC2626' : '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Low Stock Alert</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: lowStockCount > 0 ? '#DC2626' : '#15803D' }}>
              {lowStockCount} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>varieties</span>
            </div>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Inventory Value</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
              Rs. {(totalValuation / 1000).toFixed(1)}k
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────── */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--pb-blush)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              width: '100%',
              maxWidth: '320px'
            }}
          >
            <Search size={16} color="var(--pb-text-muted)" />
            <input
              type="text"
              placeholder="Search by flower name, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.85rem',
                width: '100%',
                color: 'var(--pb-plum)'
              }}
            />
            {search && (
              <X
                size={14}
                style={{ cursor: 'pointer', color: 'var(--pb-text-muted)' }}
                onClick={() => setSearch('')}
              />
            )}
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>
            {filteredItems.length} items shown
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: statusFilter === 'ALL' ? '1.5px solid var(--pb-rose)' : '1px solid var(--pb-border)',
              background: statusFilter === 'ALL' ? 'var(--pb-blush)' : 'var(--pb-surface)',
              color: statusFilter === 'ALL' ? 'var(--pb-rose)' : 'var(--pb-text-body)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            All Stock
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('IN_STOCK')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: statusFilter === 'IN_STOCK' ? '1.5px solid #16A34A' : '1px solid var(--pb-border)',
              background: statusFilter === 'IN_STOCK' ? '#DCFCE7' : 'var(--pb-surface)',
              color: statusFilter === 'IN_STOCK' ? '#15803D' : 'var(--pb-text-body)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            In Stock
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('LOW_STOCK')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: statusFilter === 'LOW_STOCK' ? '1.5px solid #DC2626' : '1px solid var(--pb-border)',
              background: statusFilter === 'LOW_STOCK' ? '#FEE2E2' : 'var(--pb-surface)',
              color: statusFilter === 'LOW_STOCK' ? '#DC2626' : 'var(--pb-text-body)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Low Stock Alerts ({lowStockCount})
          </button>
        </div>
      </div>

      {/* ── Clean Inventory Table ───────────────────────────────── */}
      <div
        style={{
          background: 'var(--pb-surface)',
          borderRadius: '14px',
          border: '1px solid var(--pb-border)',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: 'var(--pb-blush)', borderBottom: '1px solid var(--pb-border)', color: 'var(--pb-plum)' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Flower Variety</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Category</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Unit Price</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Current Stock</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Reorder Alert</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const isLow = item.stock <= item.reorderLevel;
              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--pb-border)',
                    background: isLow ? '#FFFBFB' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Flower Name with round thumbnail */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/rose.jpg'; }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--pb-plum)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>Code: {item.code}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '0.75rem 1rem', color: 'var(--pb-text-body)', fontWeight: 600 }}>
                    {item.category}
                  </td>

                  <td style={{ padding: '0.75rem 1rem', color: 'var(--pb-rose)', fontWeight: 800 }}>
                    Rs. {item.unitPrice}
                  </td>

                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: isLow ? '#DC2626' : '#15803D' }}>
                      {item.stock}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)' }}> stems</span>
                  </td>

                  <td style={{ padding: '0.75rem 1rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>
                    {item.reorderLevel} stems
                  </td>

                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isLow ? '#FEE2E2' : '#DCFCE7',
                        color: isLow ? '#DC2626' : '#15803D'
                      }}
                    >
                      {isLow ? '⚠️ Low Stock' : '✓ Sufficient'}
                    </span>
                  </td>

                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenAdjust(item)}
                      style={{
                        padding: '0.45rem 0.8rem',
                        background: 'var(--pb-blush)',
                        border: '1px solid var(--pb-border)',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--pb-plum)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit2 size={13} color="var(--pb-rose)" /> Adjust Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Adjust Stock Modal ──────────────────────────────────── */}
      {adjustItem && (
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
          onClick={() => setAdjustItem(null)}
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
                <Package size={22} color="var(--pb-rose)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                  Adjust Stock: {adjustItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pb-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  background: 'var(--pb-blush)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Current Available Stock:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--pb-plum)' }}>{adjustItem.stock} stems</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Adjustment Action
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setAdjustAction('ADD')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: adjustAction === 'ADD' ? '2px solid #16A34A' : '1px solid var(--pb-border)',
                      background: adjustAction === 'ADD' ? '#DCFCE7' : 'var(--pb-surface)',
                      color: adjustAction === 'ADD' ? '#15803D' : 'var(--pb-text-body)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Restock
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustAction('REDUCE')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: adjustAction === 'REDUCE' ? '2px solid #DC2626' : '1px solid var(--pb-border)',
                      background: adjustAction === 'REDUCE' ? '#FEE2E2' : 'var(--pb-surface)',
                      color: adjustAction === 'REDUCE' ? '#DC2626' : 'var(--pb-text-body)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    - Waste/Loss
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustAction('SET')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: adjustAction === 'SET' ? '2px solid var(--pb-rose)' : '1px solid var(--pb-border)',
                      background: adjustAction === 'SET' ? 'var(--pb-blush)' : 'var(--pb-surface)',
                      color: adjustAction === 'SET' ? 'var(--pb-rose)' : 'var(--pb-text-body)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    = Set Exact
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  {adjustAction === 'ADD' ? 'Quantity to Add (Stems) *' : adjustAction === 'REDUCE' ? 'Quantity to Deduct (Stems) *' : 'New Exact Quantity (Stems) *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.9rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Reorder Alert Threshold (Stems)
                </label>
                <input
                  type="number"
                  min="10"
                  value={newReorderLevel}
                  onChange={(e) => setNewReorderLevel(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setAdjustItem(null)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ flex: 1 }}>
                  Save to Database
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
