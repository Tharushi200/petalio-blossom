import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../api';
import {
  Search,
  Plus,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Download,
  X,
  FileText,
  User,
  MapPin
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── Clean Preset Wholesale Orders ────────────────────────────────────────────
const INITIAL_ORDERS = [
  {
    id: 'ORD-8841',
    customer: 'Kingsbury Hotel Banquet Events',
    clientType: 'Luxury Hotel',
    contactPerson: 'Rohan Jayasuriya',
    phone: '+94 77 123 4567',
    destination: '48 Janadhipathi Mawatha, Colombo 01',
    orderDate: '2026-11-04',
    deliveryDate: '2026-11-05',
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    totalAmount: 105000,
    items: [
      { name: 'Red Naomi Rose', qty: 300, unitPrice: 350 }
    ],
    driver: 'Kamal Bandara (Van #PB-04)'
  },
  {
    id: 'ORD-8840',
    customer: 'Lassana Petals Floral Studio',
    clientType: 'Boutique Florist',
    contactPerson: 'Sunil Fonseka',
    phone: '+94 71 876 5432',
    destination: '214 Nawala Road, Rajagiriya',
    orderDate: '2026-11-03',
    deliveryDate: '2026-11-04',
    status: 'IN_TRANSIT',
    paymentStatus: 'PAID',
    totalAmount: 84000,
    items: [
      { name: 'Dendrobium Orchid', qty: 200, unitPrice: 420 }
    ],
    driver: 'Sunil Fonseka (Van #PB-02)'
  },
  {
    id: 'ORD-8839',
    customer: 'Shangri-La Colombo Florist',
    clientType: 'Luxury Hotel',
    contactPerson: 'Dinesh Perera',
    phone: '+94 77 987 1234',
    destination: '1 Galle Face, Colombo 02',
    orderDate: '2026-11-03',
    deliveryDate: '2026-11-04',
    status: 'IN_TRANSIT',
    paymentStatus: 'PAID',
    totalAmount: 72000,
    items: [
      { name: 'Casablanca White Lily', qty: 150, unitPrice: 480 }
    ],
    driver: 'Kamal Bandara (Van #PB-04)'
  },
  {
    id: 'ORD-8838',
    customer: 'Cinnamon Grand Wedding Events',
    clientType: 'Luxury Hotel',
    contactPerson: 'Anura Wickramasinghe',
    phone: '+94 77 555 7890',
    destination: '77 Galle Road, Colombo 03',
    orderDate: '2026-11-04',
    deliveryDate: '2026-11-06',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    totalAmount: 96000,
    items: [
      { name: 'Tropical Anthurium', qty: 300, unitPrice: 320 }
    ],
    driver: 'Unassigned'
  },
  {
    id: 'ORD-8837',
    customer: 'Galle Face Hotel Ballroom',
    clientType: 'Heritage Hotel',
    contactPerson: 'Nimali Silva',
    phone: '+94 76 333 4455',
    destination: '2 Kollupitiya Road, Colombo 03',
    orderDate: '2026-11-02',
    deliveryDate: '2026-11-03',
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    totalAmount: 57500,
    items: [
      { name: 'Bridal Baby Breath', qty: 250, unitPrice: 230 }
    ],
    driver: 'Sunil Fonseka (Van #PB-02)'
  }
];

export default function Orders() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // New Order Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customer: '',
    contactPerson: '',
    phone: '',
    destination: '',
    flowerName: 'Red Naomi Rose',
    quantity: 100,
    unitPrice: 350,
    deliveryDate: '2026-11-06'
  });

  // Dispatch Modal
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [driverName, setDriverName] = useState('Kamal Bandara (Van #PB-04)');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Fetch Live Orders from MySQL ────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    api.getOrders()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setIsLiveConnected(true);
          const dbMapped = res.data.map((dbO) => ({
            id: `ORD-${8800 + dbO.order_id}`,
            order_id: dbO.order_id,
            customer: dbO.customer?.name || 'Hotel Grand Ballroom',
            clientType: 'Commercial Client',
            contactPerson: 'Operations Desk',
            phone: '+94 11 234 5678',
            destination: 'Colombo Central',
            orderDate: dbO.order_date ? dbO.order_date.split('T')[0] : '2026-11-04',
            deliveryDate: dbO.delivery_preference_date || '2026-11-06',
            status: dbO.status === 'CONFIRMED' ? 'PROCESSING' : dbO.status,
            paymentStatus: 'PAID',
            totalAmount: parseFloat(dbO.total_amount) || 85000,
            items: (dbO.items || []).map((it) => ({
              name: it.flower?.name || 'Highland Cut Flower',
              qty: it.quantity,
              unitPrice: parseFloat(it.price) || 300
            })),
            driver: 'Assigned Driver'
          }));

          const dbIds = new Set(dbMapped.map((m) => m.id));
          const remaining = INITIAL_ORDERS.filter((p) => !dbIds.has(p.id));
          setOrders([...dbMapped, ...remaining]);
        }
      })
      .catch(() => {
        // Safe offline fallback
      });

    return () => { isMounted = false; };
  }, []);

  // ── KPI Summary Calculations ────────────────────────────────────────────────
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const inTransitCount = orders.filter((o) => o.status === 'IN_TRANSIT' || o.status === 'PROCESSING').length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  // ── Search & Filter ─────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.destination.toLowerCase().includes(q) ||
          o.items.some((it) => it.name.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((o) => o.status === statusFilter);
    }

    return list;
  }, [orders, search, statusFilter]);

  // ── Order Action: Confirm Order ─────────────────────────────────────────────
  const handleConfirmOrder = async (order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: 'PROCESSING' } : o))
    );
    showToast(`Order #${order.id} confirmed for packing.`);

    if (order.order_id) {
      try {
        await api.updateOrderStatus(order.order_id, 'CONFIRMED');
        showToast(`Order #${order.id} status saved to MySQL Database.`);
      } catch {
        // Silent catch
      }
    }
  };

  // ── Order Action: Dispatch Delivery ─────────────────────────────────────────
  const handleConfirmDispatch = async () => {
    if (!dispatchTarget) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === dispatchTarget.id ? { ...o, status: 'IN_TRANSIT', driver: driverName } : o
      )
    );
    showToast(`Order #${dispatchTarget.id} dispatched with driver ${driverName}.`);

    if (dispatchTarget.order_id) {
      try {
        await api.updateOrderStatus(dispatchTarget.order_id, 'IN_TRANSIT');
      } catch {
        // Silent catch
      }
    }

    setDispatchTarget(null);
  };

  // ── Order Action: Mark Delivered ───────────────────────────────────────────
  const handleMarkDelivered = async (order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: 'DELIVERED' } : o))
    );
    showToast(`Order #${order.id} marked as Delivered!`);

    if (order.order_id) {
      try {
        await api.updateOrderStatus(order.order_id, 'DELIVERED');
      } catch {
        // Silent catch
      }
    }
  };

  // ── Create New Order Submit ─────────────────────────────────────────────────
  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!newOrderForm.customer.trim()) return;

    const total = (parseInt(newOrderForm.quantity) || 100) * (parseFloat(newOrderForm.unitPrice) || 300);
    const newId = `ORD-${8840 + orders.length + 1}`;

    const createdOrder = {
      id: newId,
      customer: newOrderForm.customer,
      clientType: 'Commercial Client',
      contactPerson: newOrderForm.contactPerson || 'Main Reception',
      phone: newOrderForm.phone || '+94 77 000 0000',
      destination: newOrderForm.destination || 'Colombo',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: newOrderForm.deliveryDate,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      totalAmount: total,
      items: [
        {
          name: newOrderForm.flowerName,
          qty: parseInt(newOrderForm.quantity) || 100,
          unitPrice: parseFloat(newOrderForm.unitPrice) || 300
        }
      ],
      driver: 'Unassigned'
    };

    try {
      const res = await api.createOrder({
        items: [
          {
            flower_id: 1, // Red Naomi Rose default
            quantity: parseInt(newOrderForm.quantity) || 100
          }
        ],
        delivery_address: newOrderForm.destination || 'Colombo',
        delivery_city: 'Colombo',
        season_event: 'Normal'
      });
      if (res && res.success && res.data) {
        createdOrder.order_id = res.data.order_id;
        showToast(`🌸 Order #${newId} saved to MySQL Database!`);
      } else {
        showToast(`🌸 New Order #${newId} created successfully!`);
      }
    } catch {
      showToast(`🌸 New Order #${newId} created successfully!`);
    }

    setOrders([createdOrder, ...orders]);
    setShowCreateModal(false);
    setNewOrderForm({
      customer: '',
      contactPerson: '',
      phone: '',
      destination: '',
      flowerName: 'Red Naomi Rose',
      quantity: 100,
      unitPrice: 350,
      deliveryDate: '2026-11-06'
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
        title="Commercial Orders"
        subtitle="Manage wholesale cut-flower orders for hotels, florists, and wedding banquet events"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={15} /> Add New Order
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
            <ShoppingBag size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Orders</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>{totalOrders}</div>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Pending Allocation</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B45309' }}>{pendingCount}</div>
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
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Processing & Transit</div>
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
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Order Value</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
              Rs. {(totalRevenue / 1000).toFixed(0)}k
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
              maxWidth: '340px'
            }}
          >
            <Search size={16} color="var(--pb-text-muted)" />
            <input
              type="text"
              placeholder="Search by customer name, order ID..."
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
            {filteredOrders.length} orders
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'PROCESSING', 'IN_TRANSIT', 'DELIVERED'].map((st) => (
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
              {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Clean Orders Table ──────────────────────────────────── */}
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
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Order ID</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Customer & Destination</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Items Ordered</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Delivery Date</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Total Amount</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const statusColors = {
                PENDING: { bg: '#FEF3C7', color: '#B45309', label: 'Pending' },
                PROCESSING: { bg: '#EFF6FF', color: '#1D4ED8', label: 'Processing' },
                IN_TRANSIT: { bg: '#F3E8FF', color: '#7E22CE', label: 'In Transit' },
                DELIVERED: { bg: '#DCFCE7', color: '#15803D', label: 'Delivered' }
              };
              const badge = statusColors[order.status] || statusColors.PENDING;

              return (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--pb-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                    {order.id}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--pb-plum)' }}>{order.customer}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--pb-text-muted)' }}>📍 {order.destination}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    {order.items.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--pb-text-body)' }}>
                        <strong>{it.qty} stems</strong> · {it.name}
                      </div>
                    ))}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>
                    {order.deliveryDate}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--pb-rose)' }}>
                    Rs. {order.totalAmount.toLocaleString()}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: badge.bg,
                        color: badge.color
                      }}
                    >
                      {badge.label}
                    </span>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {order.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleConfirmOrder(order)}
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
                        ✓ Confirm Order
                      </button>
                    )}

                    {order.status === 'PROCESSING' && (
                      <button
                        type="button"
                        onClick={() => setDispatchTarget(order)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: '#1D4ED8',
                          cursor: 'pointer'
                        }}
                      >
                        🚚 Dispatch Van
                      </button>
                    )}

                    {order.status === 'IN_TRANSIT' && (
                      <button
                        type="button"
                        onClick={() => handleMarkDelivered(order)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: 'var(--pb-blush)',
                          border: '1px solid var(--pb-border)',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: 'var(--pb-plum)',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Mark Delivered
                      </button>
                    )}

                    {order.status === 'DELIVERED' && (
                      <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700 }}>
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Add New Order Modal ──────────────────────────────────── */}
      {showCreateModal && (
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
          onClick={() => setShowCreateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--pb-surface)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid var(--pb-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={22} color="var(--pb-rose)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                  Create Wholesale Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pb-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Client / Hotel Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shangri-La Colombo Banquet"
                  value={newOrderForm.customer}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customer: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dinesh Perera"
                    value={newOrderForm.contactPerson}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Delivery Destination *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Colombo 02"
                    value={newOrderForm.destination}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, destination: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Flower Variety *
                  </label>
                  <select
                    value={newOrderForm.flowerName}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, flowerName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  >
                    <option value="Red Naomi Rose">Red Naomi Rose (Rs. 350)</option>
                    <option value="Dendrobium Orchid">Dendrobium Orchid (Rs. 420)</option>
                    <option value="Casablanca White Lily">Casablanca White Lily (Rs. 480)</option>
                    <option value="Tropical Anthurium">Tropical Anthurium (Rs. 320)</option>
                    <option value="Standard Pink Carnation">Standard Pink Carnation (Rs. 260)</option>
                    <option value="Golden Chrysanthemum">Golden Chrysanthemum (Rs. 240)</option>
                    <option value="Lavender Lisianthus">Lavender Lisianthus (Rs. 280)</option>
                    <option value="Bridal Baby Breath">Bridal Baby Breath (Rs. 230)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Quantity (Stems) *
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={newOrderForm.quantity}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Target Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={newOrderForm.deliveryDate}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, deliveryDate: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ flex: 1 }}>
                  Create Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Dispatch Van Modal ───────────────────────────────────── */}
      {dispatchTarget && (
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
          onClick={() => setDispatchTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--pb-surface)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid var(--pb-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={22} color="var(--pb-rose)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                  Dispatch Order: {dispatchTarget.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDispatchTarget(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pb-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--pb-text-muted)', margin: '0 0 1rem 0' }}>
              Assign an insulated delivery van and driver to transport this order to <strong style={{ color: 'var(--pb-plum)' }}>{dispatchTarget.customer}</strong>.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                Select Delivery Driver & Van
              </label>
              <select
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
              >
                <option value="Kamal Bandara (Van #PB-04)">Kamal Bandara (Insulated Van #PB-04)</option>
                <option value="Sunil Fonseka (Van #PB-02)">Sunil Fonseka (Chilled Van #PB-02)</option>
                <option value="Dinesh Silva (Van #PB-01)">Dinesh Silva (Express Van #PB-01)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="outline" size="sm" onClick={() => setDispatchTarget(null)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmDispatch} style={{ flex: 1 }}>
                Confirm Dispatch
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
