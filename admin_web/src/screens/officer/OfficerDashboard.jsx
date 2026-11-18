import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  ShoppingBag,
  Flower2,
  AlertTriangle,
  TrendingUp,
  Truck,
  Sparkles,
  Download,
  Plus
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  OFFICER_MONTHLY_SALES,
  INVENTORY_DISTRIBUTION,
  OFFICER_RECENT_ORDERS,
  LOW_STOCK_ALERTS,
  UPCOMING_DELIVERIES
} from '../../data/mockData';

// 4 Focused KPI Stat Cards (Clean, consistent, no awkward wraps)
const OFFICER_STATS_DATA = [
  {
    id: 'total_orders',
    title: 'Total Orders',
    value: '1,284',
    change: '+14.6%',
    isPositive: true,
    subtext: 'vs last month',
    icon: ShoppingBag
  },
  {
    id: 'available_stock',
    title: 'Available Flower Stock',
    value: '15,420',
    change: 'In Warehouse',
    isPositive: true,
    subtext: 'Fresh stems',
    icon: Flower2
  },
  {
    id: 'low_stock',
    title: 'Low Stock Items',
    value: '4 Varieties',
    change: 'Action Required',
    isPositive: false,
    subtext: 'Below threshold',
    icon: AlertTriangle
  },
  {
    id: 'total_sales',
    title: 'Total Revenue',
    value: 'Rs 6.85M',
    change: '+16.5%',
    isPositive: true,
    subtext: 'Target: Rs 6.2M',
    icon: TrendingUp
  }
];

export default function OfficerDashboard() {
  const [orders, setOrders] = useState(OFFICER_RECENT_ORDERS);
  const [lowStockList, setLowStockList] = useState(LOW_STOCK_ALERTS);
  const [selectedLowStock, setSelectedLowStock] = useState(null);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'deliveries'

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOrderStock = (item) => {
    setSelectedLowStock(item);
  };

  const handleConfirmOrder = () => {
    if (!selectedLowStock) return;
    showToast(
      `Order sent to ${selectedLowStock.preferredSupplier} for ${selectedLowStock.deficit} flowers.`
    );
    setLowStockList((prev) => prev.filter((i) => i.id !== selectedLowStock.id));
    setSelectedLowStock(null);
  };

  const handleDispatchOrder = (order) => {
    setSelectedOrderForAction(order);
  };

  const handleConfirmDispatch = () => {
    if (!selectedOrderForAction) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForAction.id ? { ...o, status: 'IN_TRANSIT' } : o
      )
    );
    showToast(`Order #${selectedOrderForAction.id} sent for delivery.`);
    setSelectedOrderForAction(null);
  };

  // Recent Orders table columns
  const orderColumns = [
    {
      key: 'id',
      header: 'Order Ref',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--pb-rose)' }}>
          {row.id}
        </span>
      )
    },
    {
      key: 'customer',
      header: 'Customer / Client',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--pb-plum)' }}>
          {row.customer}
        </span>
      )
    },
    {
      key: 'flower',
      header: 'Flower Variety',
      render: (row) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--pb-text-body)' }}>
          {row.flower}
        </span>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--pb-plum)' }}>
          {row.quantity}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Total Value',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--pb-plum)' }}>
          {row.amount}
        </span>
      )
    },
    {
      key: 'deliveryDate',
      header: 'Delivery Date',
      render: (row) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--pb-text-muted)' }}>
          {row.deliveryDate}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
          {row.status === 'PROCESSING' ? (
            <button
              type="button"
              onClick={() => handleDispatchOrder(row)}
              className="btn btn-sm btn-primary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
            >
              Dispatch
            </button>
          ) : (
            <button
              type="button"
              onClick={() => showToast(`Order #${row.id} details verified.`)}
              className="btn btn-sm btn-outline"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
            >
              View
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 999,
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

      {/* Page Header (Clean, professional, Figma-grade) */}
      <PageHeader
        title="Dashboard"
        subtitle="Track customer orders, flower stock levels, and deliveries."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => showToast('Stock report exported to CSV.')}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => showToast('New flower order initialized.')}
            >
              Order Flowers
            </Button>
          </div>
        }
      />

      {/* 4 Focused KPI Stat Cards in 1 Clean Aligned Row */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        {OFFICER_STATS_DATA.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            subtext={stat.subtext}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Middle Section: Balanced 2-Column Overview (Equal Height Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '1.5rem',
          marginBottom: '1.5rem',
          alignItems: 'stretch'
        }}
        className="officer-mid-grid"
      >
        {/* Chart 1: Monthly Sales vs Target */}
        <div className="royal-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--pb-plum)',
                  margin: 0
                }}
              >
                Monthly Sales Overview
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--pb-text-muted)', margin: '0.15rem 0 0 0' }}>
                Monthly sales vs target (Million LKR)
              </p>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--pb-radius-sm)',
                background: 'var(--pb-tint)',
                color: 'var(--pb-rose)',
                fontWeight: 600
              }}
            >
              Rs 6.85M This Month
            </span>
          </div>

          <div style={{ height: '230px', width: '100%', flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={OFFICER_MONTHLY_SALES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--pb-rose)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--pb-rose)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--pb-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--pb-text-muted)' }} stroke="var(--pb-border)" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--pb-text-muted)' }} stroke="var(--pb-border)" />
                <Tooltip
                  formatter={(val) => [`Rs ${val} Million`, 'Sales']}
                  contentStyle={{
                    backgroundColor: 'var(--pb-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--pb-border)',
                    boxShadow: 'var(--pb-shadow)',
                    fontSize: '0.78rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Monthly Sales"
                  stroke="var(--pb-rose)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="var(--pb-gold)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inventory Distribution by Variety */}
        <div className="royal-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--pb-plum)',
                margin: 0
              }}
            >
              Inventory by Flower Variety
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--pb-text-muted)', margin: '0.15rem 0 0 0' }}>
              Breakdown of 15,420 total fresh stems in stock
            </p>
          </div>

          <div style={{ height: '175px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INVENTORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {INVENTORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`dist-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val} stems`, 'In Stock']}
                  contentStyle={{
                    backgroundColor: 'var(--pb-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--pb-border)',
                    fontSize: '0.75rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Clean 2-Column Mini Legend */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.35rem 0.75rem',
              paddingTop: '0.4rem',
              borderTop: '1px solid var(--pb-border)'
            }}
          >
            {INVENTORY_DISTRIBUTION.slice(0, 4).map((item) => (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.74rem'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0
                  }}
                />
                <span style={{ color: 'var(--pb-text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
                <strong style={{ marginLeft: 'auto', color: 'var(--pb-plum)', fontSize: '0.74rem' }}>
                  {item.value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Low Stock Notice (Compact, neatly aligned) */}
      {lowStockList.length > 0 && (
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1px solid var(--pb-border)',
            borderLeft: '4px solid var(--pb-gold)',
            borderRadius: 'var(--pb-radius-md)',
            padding: '0.9rem 1.25rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--pb-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--pb-gold-tint)',
                color: 'var(--pb-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--pb-plum)' }}>
                Low Stock Alert ({lowStockList.length} Varieties)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)' }}>
                {lowStockList.map((i) => `${i.flower} (-${i.deficit})`).join(' • ')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {lowStockList.slice(0, 2).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleOrderStock(item)}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              >
                Order {item.flower.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: Clean Tabbed Table (Orders & Deliveries) */}
      <div className="table-container">
        <div className="table-header-bar" style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--pb-tint)',
                padding: '3px',
                borderRadius: '8px'
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                style={{
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'orders' ? 'var(--pb-surface)' : 'transparent',
                  color: activeTab === 'orders' ? 'var(--pb-rose)' : 'var(--pb-text-body)',
                  boxShadow: activeTab === 'orders' ? 'var(--pb-shadow)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Commercial Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('deliveries')}
                style={{
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'deliveries' ? 'var(--pb-surface)' : 'transparent',
                  color: activeTab === 'deliveries' ? 'var(--pb-rose)' : 'var(--pb-text-body)',
                  boxShadow: activeTab === 'deliveries' ? 'var(--pb-shadow)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Scheduled Deliveries ({UPCOMING_DELIVERIES.length})
              </button>
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)' }}>
            Real-time Logistics Sync
          </span>
        </div>

        {activeTab === 'orders' ? (
          <DataTable
            columns={orderColumns}
            data={orders}
            keyField="id"
          />
        ) : (
          <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {UPCOMING_DELIVERIES.map((del) => (
              <div
                key={del.id}
                style={{
                  padding: '1rem 1.15rem',
                  borderRadius: 'var(--pb-radius-md)',
                  background: 'var(--pb-blush)',
                  border: '1px solid var(--pb-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                    <Truck size={15} style={{ color: 'var(--pb-rose)' }} />
                    <strong style={{ fontSize: '0.88rem', color: 'var(--pb-plum)' }}>{del.client}</strong>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--pb-text-muted)' }}>
                    Destination: {del.destination} • Driver: {del.driver}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--pb-text-body)', marginTop: '0.3rem', fontWeight: 500 }}>
                    ETA: {del.eta}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={del.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Procuring Stock */}
      <ConfirmDialog
        isOpen={!!selectedLowStock}
        title="Issue Sourcing Purchase Order"
        message={
          selectedLowStock ? (
            <div>
              <p style={{ marginBottom: '0.75rem' }}>
                Dispatch a purchase order for{' '}
                <strong>{selectedLowStock.deficit} stems</strong> of{' '}
                <strong>{selectedLowStock.flower}</strong> to grower{' '}
                <strong>{selectedLowStock.preferredSupplier}</strong>?
              </p>
              <div
                style={{
                  background: 'var(--pb-tint)',
                  padding: '0.75rem',
                  borderRadius: 'var(--pb-radius-sm)',
                  fontSize: '0.8rem',
                  border: '1px solid var(--pb-border)'
                }}
              >
                <div>Current Stock: {selectedLowStock.currentStems} flowers</div>
                <div>Minimum Stock: {selectedLowStock.minThreshold} flowers</div>
              </div>
            </div>
          ) : null
        }
        confirmText="Send Order"
        variant="primary"
        onConfirm={handleConfirmOrder}
        onCancel={() => setSelectedLowStock(null)}
      />

      {/* Confirmation Dialog for Dispatching Order */}
      <ConfirmDialog
        isOpen={!!selectedOrderForAction}
        title="Send Flower Order"
        message={
          selectedOrderForAction ? (
            <div>
              <p style={{ marginBottom: '0.75rem' }}>
                Send order <strong>#{selectedOrderForAction.id}</strong> to{' '}
                <strong>{selectedOrderForAction.customer}</strong> for delivery?
              </p>
              <div
                style={{
                  background: 'var(--pb-tint)',
                  padding: '0.75rem',
                  borderRadius: 'var(--pb-radius-sm)',
                  fontSize: '0.8rem',
                  border: '1px solid var(--pb-border)'
                }}
              >
                <div>Flower: {selectedOrderForAction.flower}</div>
                <div>Quantity: {selectedOrderForAction.quantity}</div>
                <div>Amount: {selectedOrderForAction.amount}</div>
              </div>
            </div>
          ) : null
        }
        confirmText="Send Order"
        variant="primary"
        onConfirm={handleConfirmDispatch}
        onCancel={() => setSelectedOrderForAction(null)}
      />
    </div>
  );
}
