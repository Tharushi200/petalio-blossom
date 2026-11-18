import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { Plus, Flower2, Tag, Layers, AlertTriangle, Pencil, X } from 'lucide-react';

const categories = [
  { emoji: '🌹', name: 'Roses',            varieties: 28, season: 'Peak: Nov–Feb',   color: '#c0376b', desc: 'Red, White, Pink, Yellow' },
  { emoji: '🌸', name: 'Orchids',           varieties: 19, season: 'Year Round',      color: '#7c3aed', desc: 'Dendrobium, Cymbidium, Mokara' },
  { emoji: '🌷', name: 'Lilies',            varieties: 16, season: 'Peak: Mar–Jun',   color: '#0891b2', desc: 'Asiatic, Oriental, Lotus' },
  { emoji: '🌺', name: 'Anthuriums',        varieties: 12, season: 'Year Round',      color: '#dc2626', desc: 'Red, Pink, White, Green' },
  { emoji: '🪷', name: 'Traditional',       varieties: 18, season: 'Peak: Apr, May',  color: '#d97706', desc: 'Araliya, Lotus, Jasmine, Tuberose' },
  { emoji: '🌼', name: 'Carnations',        varieties: 14, season: 'Peak: Dec–Mar',   color: '#059669', desc: 'Red, White, Striped, Mini' },
  { emoji: '🌿', name: 'Foliage & Fillers', varieties: 21, season: 'Year Round',      color: '#166534', desc: "Baby's Breath, Fern, Eucalyptus" },
  { emoji: '🌻', name: 'Exotics',           varieties: 14, season: 'Peak: Jun–Sep',   color: '#9333ea', desc: 'Bird of Paradise, Protea, Heliconia' },
];

const LOW_STOCK_COUNT = 3;
const totalVarieties = categories.reduce((sum, c) => sum + c.varieties, 0);

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ─── KPI Card ─────────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={{
      flex: '1 1 180px',
      background: 'var(--pb-surface)',
      border: '1px solid var(--pb-border)',
      borderRadius: 16,
      padding: '24px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      boxShadow: 'var(--pb-shadow)',
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: hexToRgba(accent, 0.12),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={26} color={accent} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{
          fontSize: 28,
          fontWeight: 700,
          fontFamily: 'var(--pb-font-heading)',
          color: accent,
          lineHeight: 1.1,
        }}>{value}</div>
        <div style={{
          fontSize: 13,
          color: '#6b7280',
          marginTop: 3,
          fontFamily: 'var(--pb-font-body)',
        }}>{label}</div>
      </div>
    </div>
  );
}

/* ─── Category Tile ─────────────────────────────────────────── */
function CategoryTile({ cat, onEdit }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.13)'
          : '0 2px 12px rgba(0,0,0,0.07)',
        borderTop: `4px solid ${cat.color}`,
        padding: '28px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        position: 'relative',
        cursor: 'default',
        transform: hovered ? 'scale(1.025)' : 'scale(1)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
    >
      {/* Emoji circle */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: hexToRgba(cat.color, 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        marginBottom: 2,
      }}>
        {cat.emoji}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: 'var(--pb-font-heading)',
        fontWeight: 700,
        fontSize: 18,
        color: '#1f2937',
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {cat.name}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 1.4,
        fontFamily: 'var(--pb-font-body)',
      }}>
        {cat.desc}
      </div>

      {/* Varieties count */}
      <div style={{
        fontSize: 13,
        color: '#6b7280',
        fontFamily: 'var(--pb-font-body)',
      }}>
        {cat.varieties} varieties
      </div>

      {/* Season badge */}
      <div style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 999,
        background: hexToRgba(cat.color, 0.1),
        color: cat.color,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'var(--pb-font-body)',
        letterSpacing: 0.2,
        marginTop: 2,
      }}>
        {cat.season}
      </div>

      {/* Edit button */}
      <button
        onClick={() => onEdit(cat)}
        title="Edit category"
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#374151'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; }}
      >
        <Pencil size={15} strokeWidth={1.8} />
      </button>
    </div>
  );
}

/* ─── Add / Edit Modal ──────────────────────────────────────── */
function CategoryModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name:    initial?.name    ?? '',
    emoji:   initial?.emoji   ?? '',
    desc:    initial?.desc    ?? '',
    season:  initial?.season  ?? '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid var(--pb-border)',
    fontFamily: 'var(--pb-font-body)',
    fontSize: 14,
    color: '#1f2937',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fafafa',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
    fontFamily: 'var(--pb-font-body)',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(3px)',
      }}
    >
      {/* Modal panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '36px 32px 28px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#f3f4f6',
            border: 'none',
            borderRadius: 8,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7280',
          }}
        >
          <X size={16} />
        </button>

        {/* Title */}
        <div style={{
          fontFamily: 'var(--pb-font-heading)',
          fontSize: 22,
          fontWeight: 700,
          color: '#1f2937',
          marginBottom: 24,
        }}>
          {isEdit ? `Edit "${initial.name}"` : 'Add New Category'}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Category Name</label>
            <input
              style={inputStyle}
              placeholder="e.g. Sunflowers"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Emoji</label>
            <input
              style={{ ...inputStyle, maxWidth: 90, fontSize: 22 }}
              placeholder="🌸"
              value={form.emoji}
              onChange={e => set('emoji', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 76 }}
              placeholder="Varieties or notes…"
              value={form.desc}
              onChange={e => set('desc', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Season / Availability</label>
            <input
              style={inputStyle}
              placeholder="e.g. Peak: Dec–Mar or Year Round"
              value={form.season}
              onChange={e => set('season', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
          marginTop: 28,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 22px',
              borderRadius: 10,
              border: '1.5px solid var(--pb-border)',
              background: '#fff',
              color: '#374151',
              fontFamily: 'var(--pb-font-body)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            style={{
              padding: '10px 26px',
              borderRadius: 10,
              border: 'none',
              background: 'var(--pb-rose)',
              color: '#fff',
              fontFamily: 'var(--pb-font-body)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(192,55,107,0.3)',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function FlowerCategories() {
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const openAdd  = ()      => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (cat)   => { setEditTarget(cat);  setModalOpen(true); };
  const closeModal = ()    => setModalOpen(false);
  const handleSave = (form) => {
    // In production this would call an API; here we just close.
    console.log('Saved category:', form);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pb-tint)', fontFamily: 'var(--pb-font-body)' }}>

      {/* Page Header */}
      <PageHeader
        title="Flower Categories"
        subtitle="Manage flower types and varieties in your catalogue"
        rightContent={
          <Button
            onClick={openAdd}
            icon={<Plus size={16} strokeWidth={2.2} />}
            style={{
              background: 'var(--pb-rose)',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 10,
              fontFamily: 'var(--pb-font-body)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 10px rgba(192,55,107,0.28)',
            }}
          >
            Add Category
          </Button>
        }
      />

      {/* Content wrapper */}
      <div style={{ padding: '32px 36px 48px', maxWidth: 1300, margin: '0 auto' }}>

        {/* ── KPI Row ── */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 36 }}>
          <KpiCard
            icon={Layers}
            label="Total Categories"
            value={categories.length}
            accent="var(--pb-plum, #7c3aed)"
          />
          <KpiCard
            icon={Flower2}
            label="Active Varieties"
            value={totalVarieties}
            accent="var(--pb-rose, #c0376b)"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Low Stock Categories"
            value={LOW_STOCK_COUNT}
            accent="#d97706"
          />
        </div>

        {/* ── Section heading ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 22,
        }}>
          <Tag size={18} color="var(--pb-rose, #c0376b)" strokeWidth={1.8} />
          <span style={{
            fontFamily: 'var(--pb-font-heading)',
            fontSize: 18,
            fontWeight: 700,
            color: '#1f2937',
          }}>
            All Categories
          </span>
          <span style={{
            fontSize: 12,
            color: '#9ca3af',
            background: '#f3f4f6',
            borderRadius: 999,
            padding: '2px 10px',
            fontWeight: 600,
          }}>
            {categories.length}
          </span>
        </div>

        {/* ── Category Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 22,
        }}>
          {categories.map(cat => (
            <CategoryTile key={cat.name} cat={cat} onEdit={openEdit} />
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <CategoryModal
          initial={editTarget}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
