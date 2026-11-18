import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Award,
  Truck,
  CheckCircle2,
  Sparkles,
  Printer,
  FileSpreadsheet,
  Filter,
  ArrowUpRight,
  Eye,
  Building,
  User,
  ShieldCheck,
  Package
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Monthly Sales Growth Chart Data ──────────────────────────────────────────
const MONTHLY_REVENUE_DATA = [
  { month: 'Jun', sales: 4.8, target: 4.5 },
  { month: 'Jul', sales: 5.2, target: 5.0 },
  { month: 'Aug', sales: 6.4, target: 5.8 },
  { month: 'Sep', sales: 5.9, target: 5.8 },
  { month: 'Oct', sales: 6.3, target: 6.0 },
  { month: 'Nov', sales: 6.85, target: 6.2 }
];

// ─── Customer Sector Revenue Breakdown ─────────────────────────────────────────
const SECTOR_SALES_DATA = [
  { name: 'Luxury Hotels', value: 4250000, color: 'var(--pb-rose)' },
  { name: 'Boutique Florists', value: 1650000, color: 'var(--pb-gold)' },
  { name: 'Event Planners', value: 950000, color: '#0284C7' }
];

// ─── Pre-built Operations Reports List ────────────────────────────────────────
const REPORT_MODULES = [
  {
    id: 'REP-SALES',
    title: 'Monthly Wholesale Sales & Revenue Digest',
    category: 'Finance & Sales',
    description: 'Itemized revenue breakdown by hotel client, average order value, payment method reconciliation, and outstanding balances.',
    metrics: 'Rs 6.85M Total Sales · 1,284 Orders · 98.2% Fulfillment',
    format: 'PDF & CSV',
    lastGenerated: 'Today, 08:30 AM',
    badge: 'Monthly Core'
  },
  {
    id: 'REP-VARIETY',
    title: 'Flower Variety Demand & Sales Breakdown',
    category: 'Product Analytics',
    description: 'Volume and revenue performance across all 23 commercial cut-flower varieties (Roses, Orchids, Lilies, Anthuriums, and foliage).',
    metrics: '15,420 Stems Sold · Red Rose #1 (32% Share)',
    format: 'PDF & CSV',
    lastGenerated: 'Yesterday, 05:00 PM',
    badge: 'Popular'
  },
  {
    id: 'REP-SUPPLIERS',
    title: 'Farm Supplier Quality & Harvest Audit',
    category: 'Procurement & Farms',
    description: 'Accredited grower delivery compliance, Grade A+ quality pass rates, harvest yield consistency, and grower payment settlement summaries.',
    metrics: '12 Highland Farms · 98.4% Quality Pass Rate',
    format: 'PDF & CSV',
    lastGenerated: '2026-11-01',
    badge: 'Supplier Audit'
  },
  {
    id: 'REP-DELIVERY',
    title: 'Fleet Delivery Fulfillment & Logistics Log',
    category: 'Logistics & Fleet',
    description: 'Refrigerated vehicle fleet utilization, route transit times (A7 Highland Express, E01 Southern, E03 Negombo), and on-time customer arrival rates.',
    metrics: '5 Fleet Vehicles · 98.8% On-Time Delivery Rate',
    format: 'PDF & CSV',
    lastGenerated: 'Today, 07:15 AM',
    badge: 'Logistics'
  }
];

// ─── Recent Generated Reports Archive ─────────────────────────────────────────
const RECENT_REPORTS_ARCHIVE = [
  {
    id: 'ARCH-1049',
    title: 'October 2026 Monthly Sales & Revenue Audit',
    category: 'Finance',
    generatedDate: '2026-11-01',
    size: '2.4 MB',
    format: 'PDF',
    generatedBy: 'Anuki Perera (Business Officer)'
  },
  {
    id: 'ARCH-1048',
    title: 'Q3 Highland Flower Sourcing & Quality Assessment',
    category: 'Suppliers',
    generatedDate: '2026-10-15',
    size: '1.8 MB',
    format: 'PDF',
    generatedBy: 'Anuki Perera (Business Officer)'
  },
  {
    id: 'ARCH-1047',
    title: 'Wedding Season Flower Demand Projection Digest',
    category: 'Forecasting',
    generatedDate: '2026-10-10',
    size: '890 KB',
    format: 'CSV',
    generatedBy: 'System ML Engine'
  },
  {
    id: 'ARCH-1046',
    title: 'Refrigerated Delivery Fleet Route Efficiency Log',
    category: 'Logistics',
    generatedDate: '2026-10-01',
    size: '1.2 MB',
    format: 'PDF',
    generatedBy: 'Anuki Perera (Business Officer)'
  }
];

export default function Reports() {
  const [timeframe, setTimeframe] = useState('MONTH'); // 'MONTH' | 'QUARTER' | 'YEAR'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadReport = (repTitle, format) => {
    showToast(`Downloading "${repTitle}" in ${format} format...`);
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
            color: 'var(--pb-surface)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--pb-radius-md)',
            boxShadow: 'var(--pb-shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.86rem',
            animation: 'fadeInDown 0.2s ease'
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--pb-rose-soft)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Reports"
        subtitle="Export wholesale sales performance, flower variety demand, and supplier fulfillment reports."
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <div style={{ display: 'inline-flex', background: 'var(--pb-surface)', border: '1.5px solid var(--pb-border)', borderRadius: '8px', padding: '2px' }}>
              {[
                { id: 'MONTH', label: 'This Month' },
                { id: 'QUARTER', label: 'Quarterly (Q4)' },
                { id: 'YEAR', label: 'Year to Date' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimeframe(t.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: timeframe === t.id ? 700 : 500,
                    cursor: 'pointer',
                    background: timeframe === t.id ? 'var(--pb-rose)' : 'transparent',
                    color: timeframe === t.id ? '#FFFFFF' : 'var(--pb-text-body)'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => showToast('Compiling comprehensive operations PDF digest...')}
            >
              Export Full Digest
            </Button>
          </div>
        }
      />

      {/* ── 4 KPI Summary Cards ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {[
          {
            label: 'Total Realized Revenue',
            value: 'Rs 6.85M',
            sub: '+16.5% vs target (Rs 6.2M)',
            icon: TrendingUp,
            color: 'var(--pb-rose)'
          },
          {
            label: 'On-Time Delivery Rate',
            value: '98.2%',
            sub: 'Colombo & Kandy hotel routes',
            icon: Truck,
            color: 'var(--pb-leaf)'
          },
          {
            label: 'Average Farm Quality',
            value: '4.8 / 5.0',
            sub: 'Grade A+ cut-flowers',
            icon: Award,
            color: '#0284C7'
          },
          {
            label: 'Flower Spoilage / Loss',
            value: '< 1.2%',
            sub: 'Temperature-controlled storage',
            icon: ShieldCheck,
            color: '#7C3AED'
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
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={19} style={{ color: stat.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--pb-plum)',
                    fontFamily: 'var(--pb-font-heading)',
                    lineHeight: 1.1
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Visual Analytics Row: Revenue Velocity + Sector Breakdown ─ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Monthly Revenue Velocity Bar Chart */}
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1.5px solid var(--pb-border)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--pb-shadow)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--pb-plum)', fontFamily: 'var(--pb-font-heading)' }}>
                Monthly Wholesale Revenue vs Target (Million LKR)
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>
                Track performance across Nuwara Eliya harvest cycles
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--pb-rose)' }}>
              Rs 6.85M Nov
            </span>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--pb-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--pb-text-muted)' }} stroke="var(--pb-border)" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--pb-text-muted)' }} stroke="var(--pb-border)" />
                <Tooltip
                  formatter={(val, name) => [`Rs ${val} Million`, name === 'sales' ? 'Revenue' : 'Target']}
                  contentStyle={{
                    backgroundColor: 'var(--pb-surface)',
                    borderRadius: '8px',
                    border: '1.5px solid var(--pb-border)',
                    fontSize: '0.78rem'
                  }}
                />
                <Bar dataKey="sales" name="Actual Sales" fill="var(--pb-rose)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Monthly Target" fill="var(--pb-gold)" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Customer Sector Donut */}
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1.5px solid var(--pb-border)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--pb-shadow)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--pb-plum)', fontFamily: 'var(--pb-font-heading)' }}>
              Sales by Customer Sector
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>
              Revenue share by client hotel tier
            </span>
          </div>

          <div style={{ height: '150px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SECTOR_SALES_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {SECTOR_SALES_DATA.map((entry, index) => (
                    <Cell key={`sector-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`Rs ${(val / 1000000).toFixed(2)}M`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'var(--pb-surface)',
                    borderRadius: '8px',
                    border: '1.5px solid var(--pb-border)',
                    fontSize: '0.75rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Sector Breakdown Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.5rem', borderTop: '1px solid var(--pb-border)' }}>
            {SECTOR_SALES_DATA.map((sec) => (
              <div key={sec.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sec.color }} />
                  <span style={{ color: 'var(--pb-text-body)' }}>{sec.name}</span>
                </div>
                <strong style={{ color: 'var(--pb-plum)' }}>
                  Rs {(sec.value / 1000000).toFixed(2)}M ({((sec.value / 6850000) * 100).toFixed(0)}%)
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4 Pre-built Report Module Cards ─────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--pb-plum)', marginBottom: '0.75rem' }}>
          OFFICIAL OPERATIONS REPORT MODULES
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {REPORT_MODULES.map((rep) => (
            <div
              key={rep.id}
              style={{
                background: 'var(--pb-surface)',
                border: '1.5px solid var(--pb-border)',
                borderRadius: '16px',
                padding: '1.25rem',
                boxShadow: 'var(--pb-shadow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: 'var(--pb-tint)',
                      color: 'var(--pb-rose)',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}
                  >
                    {rep.badge}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--pb-text-muted)' }}>
                    Generated: {rep.lastGenerated}
                  </span>
                </div>

                <h4 style={{ margin: '0.4rem 0 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                  {rep.title}
                </h4>

                <p style={{ margin: '0.4rem 0 0.75rem', fontSize: '0.76rem', color: 'var(--pb-text-body)', lineHeight: 1.4 }}>
                  {rep.description}
                </p>

                <div
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    background: 'var(--pb-blush)',
                    fontSize: '0.72rem',
                    color: 'var(--pb-plum)',
                    fontWeight: 600,
                    marginBottom: '0.85rem'
                  }}
                >
                  📊 {rep.metrics}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--pb-border)'
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>
                  Format: <strong>{rep.format}</strong>
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleDownloadReport(rep.title, 'CSV')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid var(--pb-border)',
                      background: 'var(--pb-surface)',
                      color: 'var(--pb-plum)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FileSpreadsheet size={13} /> Export CSV
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadReport(rep.title, 'PDF')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--pb-rose)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={13} /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Exported Reports Archive Table ────────────────── */}
      <div
        style={{
          background: 'var(--pb-surface)',
          border: '1.5px solid var(--pb-border)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--pb-shadow)'
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1.5px solid var(--pb-border)',
            background: 'var(--pb-blush)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
              Recent Generated Reports Archive
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>
              Historical audit records and downloads
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--pb-rose)', fontWeight: 600 }}>
            {RECENT_REPORTS_ARCHIVE.length} archived reports
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--pb-surface)', borderBottom: '1.5px solid var(--pb-border)' }}>
                <th style={{ padding: '0.85rem 1.15rem', color: 'var(--pb-plum)', fontWeight: 700 }}>Report Title</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--pb-plum)', fontWeight: 700 }}>Category</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--pb-plum)', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--pb-plum)', fontWeight: 700 }}>File Size</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--pb-plum)', fontWeight: 700 }}>Generated By</th>
                <th style={{ padding: '0.85rem 1.15rem', color: 'var(--pb-plum)', fontWeight: 700, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_REPORTS_ARCHIVE.map((arch) => (
                <tr
                  key={arch.id}
                  style={{ borderBottom: '1px solid var(--pb-border)', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--pb-blush)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.85rem 1.15rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--pb-plum)' }}>{arch.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--pb-text-muted)' }}>{arch.id}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: 'var(--pb-tint)',
                        color: 'var(--pb-rose)',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}
                    >
                      {arch.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--pb-text-body)' }}>
                    {arch.generatedDate}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--pb-text-muted)', fontSize: '0.74rem' }}>
                    {arch.size} ({arch.format})
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--pb-text-body)', fontSize: '0.76rem' }}>
                    {arch.generatedBy}
                  </td>
                  <td style={{ padding: '0.85rem 1.15rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleDownloadReport(arch.title, arch.format)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1.5px solid var(--pb-border)',
                        background: 'var(--pb-surface)',
                        color: 'var(--pb-rose)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Download size={12} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

