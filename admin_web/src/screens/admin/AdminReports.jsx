import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  TrendingUp,
  FileText,
  BarChart2,
  Users,
  Zap,
  Calendar,
  ArrowUpRight,
  Server,
  File,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const revenueData = [
  { month: 'Jun', revenue: 2.8 },
  { month: 'Jul', revenue: 3.4 },
  { month: 'Aug', revenue: 3.9 },
  { month: 'Sep', revenue: 4.5 },
  { month: 'Oct', revenue: 5.2 },
  { month: 'Nov', revenue: 6.85 },
];

const kpiCards = [
  {
    id: 1,
    label: 'Revenue YTD',
    value: 'Rs 18.4M',
    badge: '+22% vs last year',
    badgeColor: '#16a34a',
    badgeBg: '#dcfce7',
    icon: TrendingUp,
    iconColor: 'var(--pb-rose)',
    iconBg: '#fdf2f4',
  },
  {
    id: 2,
    label: 'Supplier Network Score',
    value: '91 / 100',
    badge: 'Excellent',
    badgeColor: '#16a34a',
    badgeBg: '#dcfce7',
    icon: Zap,
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
  },
  {
    id: 3,
    label: 'System Uptime',
    value: '99.8%',
    badge: 'Last 30 days',
    badgeColor: 'var(--pb-plum)',
    badgeBg: '#f3e8ff',
    icon: Server,
    iconColor: 'var(--pb-plum)',
    iconBg: '#faf5ff',
  },
  {
    id: 4,
    label: 'ML Model Accuracy',
    value: '94.2%',
    badge: 'Random Forest',
    badgeColor: '#92400e',
    badgeBg: '#fef3c7',
    icon: BarChart2,
    iconColor: 'var(--pb-gold)',
    iconBg: '#fffbeb',
  },
];

const reportCards = [
  {
    id: 1,
    title: 'Financial Summary',
    description: 'Full revenue, expenses & profit breakdown',
    generated: 'Generated Nov 1, 2026',
  },
  {
    id: 2,
    title: 'Supplier Performance',
    description: 'Grower ratings, delivery rates & quality scores',
    generated: 'Generated Oct 28, 2026',
  },
  {
    id: 3,
    title: 'Platform Analytics',
    description: 'User activity, app engagement & system stats',
    generated: 'Generated Oct 25, 2026',
  },
];

const recentDownloads = [
  {
    id: 1,
    name: 'Financial Summary — October 2026',
    by: 'Amara Perera',
    time: '2 hours ago',
  },
  {
    id: 2,
    name: 'Supplier Performance Report',
    by: 'Nuwan Silva',
    time: '5 hours ago',
  },
  {
    id: 3,
    name: 'Platform Analytics — Q3',
    by: 'Dilani Fernando',
    time: 'Yesterday, 3:45 PM',
  },
  {
    id: 4,
    name: 'Financial Summary — September 2026',
    by: 'Amara Perera',
    time: 'Oct 30, 2026',
  },
  {
    id: 5,
    name: 'Supplier Performance Report',
    by: 'Kasun Jayawardena',
    time: 'Oct 25, 2026',
  },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--pb-border)',
          borderRadius: 10,
          padding: '10px 16px',
          boxShadow: 'var(--pb-shadow)',
          fontFamily: 'var(--pb-font-body)',
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: 16, color: 'var(--pb-rose)', fontWeight: 700 }}>
          Rs {payload[0].value}M
        </p>
      </div>
    );
  }
  return null;
};

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({ message, onClose }) => (
  <div
    style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      background: 'var(--pb-rose)',
      color: '#fff',
      borderRadius: 12,
      padding: '14px 22px',
      fontFamily: 'var(--pb-font-body)',
      fontSize: 14,
      fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      zIndex: 9999,
      animation: 'fadeInUp 0.3s ease',
    }}
  >
    <Download size={16} />
    {message}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminReports() {
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadPDF = (reportTitle) => {
    showToast(`${reportTitle} download started`);
  };

  // ── Styles ──────────────────────────────────────────────────────────────────

  const styles = {
    page: {
      padding: '0 0 48px',
      fontFamily: 'var(--pb-font-body)',
      minHeight: '100vh',
      background: 'var(--pb-tint)',
    },
    section: {
      padding: '0 32px',
    },

    // KPI Row
    kpiRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 20,
      marginBottom: 28,
    },
    kpiCard: {
      background: '#fff',
      borderRadius: 16,
      padding: '22px 24px',
      border: '1px solid var(--pb-border)',
      boxShadow: 'var(--pb-shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      position: 'relative',
      overflow: 'hidden',
    },
    kpiTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    kpiIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    kpiBadge: {
      fontSize: 11,
      fontWeight: 600,
      borderRadius: 20,
      padding: '3px 10px',
    },
    kpiValue: {
      fontSize: 26,
      fontWeight: 800,
      color: '#1a1a2e',
      fontFamily: 'var(--pb-font-heading)',
      margin: 0,
      letterSpacing: '-0.5px',
    },
    kpiLabel: {
      fontSize: 13,
      color: '#6b7280',
      fontWeight: 500,
      margin: 0,
    },

    // Chart Card
    chartCard: {
      background: '#fff',
      borderRadius: 18,
      padding: '28px 28px 20px',
      border: '1px solid var(--pb-border)',
      boxShadow: 'var(--pb-shadow)',
      marginBottom: 28,
    },
    chartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    chartTitle: {
      fontSize: 17,
      fontWeight: 700,
      color: '#1a1a2e',
      fontFamily: 'var(--pb-font-heading)',
      margin: 0,
    },
    chartSubtitle: {
      fontSize: 13,
      color: '#9ca3af',
      margin: '4px 0 0',
      fontWeight: 400,
    },
    chartLegend: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      color: '#6b7280',
      fontWeight: 500,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: 'var(--pb-rose)',
    },

    // Report Cards Row
    reportRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20,
      marginBottom: 28,
    },
    reportCard: {
      background: '#fff',
      borderRadius: 16,
      padding: '24px',
      border: '1px solid var(--pb-border)',
      boxShadow: 'var(--pb-shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
    reportIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 12,
      background: '#fdf2f4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    reportTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: '#1a1a2e',
      margin: '0 0 6px',
      fontFamily: 'var(--pb-font-heading)',
    },
    reportDesc: {
      fontSize: 13,
      color: '#6b7280',
      margin: '0 0 12px',
      lineHeight: 1.5,
    },
    reportMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: '#9ca3af',
      marginBottom: 18,
      fontWeight: 500,
    },
    downloadBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      padding: '10px 0',
      borderRadius: 10,
      border: '1.5px solid var(--pb-rose)',
      background: 'transparent',
      color: 'var(--pb-rose)',
      fontFamily: 'var(--pb-font-body)',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'background 0.18s, color 0.18s',
      width: '100%',
      marginTop: 'auto',
    },

    // Recent Downloads
    downloadsCard: {
      background: '#fff',
      borderRadius: 18,
      border: '1px solid var(--pb-border)',
      boxShadow: 'var(--pb-shadow)',
      overflow: 'hidden',
    },
    downloadsHeader: {
      padding: '22px 28px 16px',
      borderBottom: '1px solid var(--pb-border)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    downloadsTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: '#1a1a2e',
      fontFamily: 'var(--pb-font-heading)',
      margin: 0,
    },
    downloadsList: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    downloadItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '15px 28px',
      borderBottom: '1px solid #f9f0f2',
    },
    downloadItemIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: '#fdf2f4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    downloadItemName: {
      fontSize: 14,
      fontWeight: 600,
      color: '#1a1a2e',
      margin: '0 0 2px',
    },
    downloadItemBy: {
      fontSize: 12,
      color: '#9ca3af',
      margin: 0,
    },
    downloadItemTime: {
      marginLeft: 'auto',
      fontSize: 12,
      color: '#6b7280',
      fontWeight: 500,
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="Platform-wide performance and financial overview"
        rightContent={
          <Button
            variant="primary"
            icon={<Download size={16} />}
            onClick={() => showToast('All reports download started')}
          >
            Download All
          </Button>
        }
      />

      <div style={styles.section}>

        {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        <div style={styles.kpiRow}>
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.id} style={styles.kpiCard}>
                <div style={styles.kpiTop}>
                  <div
                    style={{
                      ...styles.kpiIconWrap,
                      background: kpi.iconBg,
                    }}
                  >
                    <Icon size={22} color={kpi.iconColor} strokeWidth={2} />
                  </div>
                  <span
                    style={{
                      ...styles.kpiBadge,
                      color: kpi.badgeColor,
                      background: kpi.badgeBg,
                    }}
                  >
                    {kpi.badge}
                  </span>
                </div>
                <div>
                  <p style={styles.kpiValue}>{kpi.value}</p>
                  <p style={styles.kpiLabel}>{kpi.label}</p>
                </div>
                {/* Decorative corner accent */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -18,
                    right: -18,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: kpi.iconBg,
                    opacity: 0.6,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* ── Revenue Trend Chart ────────────────────────────────────────────── */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <p style={styles.chartTitle}>Revenue Trend (Rs M)</p>
              <p style={styles.chartSubtitle}>Jun 2026 — Nov 2026 · Monthly revenue in millions</p>
            </div>
            <div style={styles.chartLegend}>
              <div style={styles.legendDot} />
              Monthly Revenue
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--pb-rose)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--pb-rose)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e8eb" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'var(--pb-font-body)', fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'var(--pb-font-body)', fontWeight: 500 }}
                tickFormatter={(v) => `${v}M`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--pb-rose)"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{ fill: 'var(--pb-rose)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'var(--pb-rose)', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Downloadable Report Cards ──────────────────────────────────────── */}
        <div style={styles.reportRow}>
          {reportCards.map((report) => (
            <div key={report.id} style={styles.reportCard}>
              <div style={styles.reportIconWrap}>
                <FileText size={22} color="var(--pb-rose)" strokeWidth={2} />
              </div>
              <p style={styles.reportTitle}>{report.title}</p>
              <p style={styles.reportDesc}>{report.description}</p>
              <div style={styles.reportMeta}>
                <Calendar size={12} color="#9ca3af" />
                {report.generated}
              </div>
              <button
                style={styles.downloadBtn}
                onClick={() => handleDownloadPDF(report.title)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--pb-rose)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--pb-rose)';
                }}
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>
          ))}
        </div>

        {/* ── Recent Downloads Log ───────────────────────────────────────────── */}
        <div style={styles.downloadsCard}>
          <div style={styles.downloadsHeader}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: '#fdf2f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUpRight size={18} color="var(--pb-rose)" strokeWidth={2} />
            </div>
            <p style={styles.downloadsTitle}>Recent Downloads</p>
          </div>
          <ul style={styles.downloadsList}>
            {recentDownloads.map((item, idx) => (
              <li
                key={item.id}
                style={{
                  ...styles.downloadItem,
                  borderBottom: idx === recentDownloads.length - 1 ? 'none' : '1px solid #f9f0f2',
                }}
              >
                <div style={styles.downloadItemIcon}>
                  <File size={16} color="var(--pb-rose)" strokeWidth={2} />
                </div>
                <div>
                  <p style={styles.downloadItemName}>{item.name}</p>
                  <p style={styles.downloadItemBy}>Downloaded by {item.by}</p>
                </div>
                <span style={styles.downloadItemTime}>{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
