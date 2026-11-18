/**
 * Petalio Blossom - Mock Floriculture Farm Data
 * Royal Orchid SaaS Management System
 */

export const MOCK_USERS = {
  admin: {
    id: 1,
    name: 'Dr. K. Wickramasinghe',
    email: 'admin@petalio.lk',
    role: 'ADMIN',
    roleLabel: 'System Administrator',
    avatar: 'KW',
    phone: '+94 77 123 4567',
    department: 'Executive Governance'
  },
  officer: {
    id: 2,
    name: 'Anuki Perera',
    email: 'officer@petalio.lk',
    role: 'BUSINESS_OFFICER',
    roleLabel: 'Business Officer',
    avatar: 'AP',
    phone: '+94 71 890 1234',
    department: 'Commercial Floriculture Operations'
  }
};

// ─── ADMIN DASHBOARD DATA ─────────────────────────────────────────────

export const ADMIN_STATS = [
  {
    id: 'customers',
    title: 'Total Customers',
    value: '1,480',
    numericValue: 1480,
    change: '+12.4%',
    isPositive: true,
    subtext: 'vs previous month',
    icon: 'Users'
  },
  {
    id: 'suppliers',
    title: 'Total Suppliers',
    value: '86',
    numericValue: 86,
    change: '+4 New',
    isPositive: true,
    subtext: 'Active verified growers',
    icon: 'Flower2'
  },
  {
    id: 'pending_approvals',
    title: 'Pending Supplier Approvals',
    value: '7',
    numericValue: 7,
    change: 'Needs Review',
    isPositive: null,
    subtext: 'Awaiting inspection',
    icon: 'UserCheck'
  },
  {
    id: 'staff',
    title: 'Total Staff',
    value: '32',
    numericValue: 32,
    change: '+2',
    isPositive: true,
    subtext: 'Across logistics & ops',
    icon: 'ShieldCheck'
  },
  {
    id: 'orders',
    title: 'Total Orders',
    value: '4,320',
    numericValue: 4320,
    change: '+18.2%',
    isPositive: true,
    subtext: '98.4% fulfillment rate',
    icon: 'ShoppingBag'
  },
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: 'Rs 18.94M',
    numericValue: 18940000,
    change: '+15.8%',
    isPositive: true,
    subtext: 'Current fiscal year',
    icon: 'TrendingUp'
  }
];

export const MONTHLY_ORDER_OVERVIEW = [
  { month: 'Jan', orders: 240, fulfilled: 232 },
  { month: 'Feb', orders: 310, fulfilled: 300 },
  { month: 'Mar', orders: 380, fulfilled: 372 },
  { month: 'Apr', orders: 490, fulfilled: 480 }, // Sinhala & Tamil New Year Peak
  { month: 'May', orders: 420, fulfilled: 410 },
  { month: 'Jun', orders: 350, fulfilled: 342 },
  { month: 'Jul', orders: 390, fulfilled: 385 },
  { month: 'Aug', orders: 460, fulfilled: 450 }, // Wedding Season peak
  { month: 'Sep', orders: 410, fulfilled: 405 },
  { month: 'Oct', orders: 530, fulfilled: 520 },
  { month: 'Nov', orders: 580, fulfilled: 570 }
];

export const USER_REGISTRATION_STATS = [
  { month: 'Jun', customers: 85, suppliers: 4 },
  { month: 'Jul', customers: 110, suppliers: 6 },
  { month: 'Aug', customers: 145, suppliers: 9 },
  { month: 'Sep', customers: 130, suppliers: 5 },
  { month: 'Oct', customers: 190, suppliers: 11 },
  { month: 'Nov', customers: 215, suppliers: 14 }
];

export const ORDER_STATUS_DISTRIBUTION = [
  { name: 'Completed', value: 3420, color: 'var(--pb-leaf)' },
  { name: 'In Transit', value: 380, color: 'var(--pb-rose)' },
  { name: 'Processing', value: 430, color: 'var(--pb-gold)' },
  { name: 'Cancelled', value: 90, color: 'var(--pb-danger)' }
];

export const RECENT_SUPPLIER_REGISTRATIONS = [
  {
    id: 'SUP-1092',
    name: 'Bandarawela Orchid Blooms',
    growerName: 'Sunil Jayawardena',
    location: 'Bandarawela, Uva',
    phone: '+94 77 456 7890',
    capacity: '8,500 stems/mo',
    primaryFlower: 'Dendrobium Orchids',
    status: 'PENDING',
    appliedDate: '2026-10-28'
  },
  {
    id: 'SUP-1091',
    name: 'Hakgala Highland Flora',
    growerName: 'Manjula Rajapaksha',
    location: 'Nuwara Eliya',
    phone: '+94 71 234 5678',
    capacity: '12,000 stems/mo',
    primaryFlower: 'Red Naomi Roses',
    status: 'PENDING',
    appliedDate: '2026-10-29'
  },
  {
    id: 'SUP-1090',
    name: 'Welimada Valley Lilies',
    growerName: 'Nimali Senanayake',
    location: 'Welimada, Badulla',
    phone: '+94 76 876 5432',
    capacity: '5,000 stems/mo',
    primaryFlower: 'Stargazer Lilies',
    status: 'APPROVED',
    appliedDate: '2026-10-25'
  },
  {
    id: 'SUP-1089',
    name: 'Gampaha Tropical Anthuriums',
    growerName: 'Sarath Perera',
    location: 'Gampaha, Western',
    phone: '+94 70 345 6789',
    capacity: '6,200 stems/mo',
    primaryFlower: 'Holland Anthurium',
    status: 'APPROVED',
    appliedDate: '2026-10-22'
  },
  {
    id: 'SUP-1088',
    name: 'Knuckles Mountain Chrysanthemums',
    growerName: 'Chathura Bandara',
    location: 'Matale, Central',
    phone: '+94 78 901 2345',
    capacity: '9,400 stems/mo',
    primaryFlower: 'Spray Chrysanthemum',
    status: 'APPROVED',
    appliedDate: '2026-10-20'
  }
];

export const RECENT_ADMIN_ACTIVITIES = [
  {
    id: 'ACT-01',
    user: 'Dr. K. Wickramasinghe',
    action: 'Approved grower account for Welimada Valley Lilies',
    type: 'security',
    time: '25 mins ago',
    badge: 'SUPPLIER APPROVAL'
  },
  {
    id: 'ACT-02',
    user: 'System Bot',
    action: 'Automated database backup completed successfully',
    type: 'system',
    time: '1 hour ago',
    badge: 'SYSTEM'
  },
  {
    id: 'ACT-03',
    user: 'Anuki Perera',
    action: 'Dispatched 450 Dendrobium stems for Order #PB-8821',
    type: 'ops',
    time: '3 hours ago',
    badge: 'DISPATCH'
  },
  {
    id: 'ACT-04',
    user: 'Dr. K. Wickramasinghe',
    action: 'Updated system roles & permission matrix for Logistics Crew',
    type: 'security',
    time: '5 hours ago',
    badge: 'ROLES'
  },
  {
    id: 'ACT-05',
    user: 'Customer Mobile App',
    action: '28 new wholesale florist accounts registered via Android app',
    type: 'user',
    time: 'Yesterday',
    badge: 'MOBILE SYNC'
  }
];

export const PENDING_APPROVAL_CARDS = [
  {
    id: 'APP-01',
    grower: 'Bandarawela Orchid Blooms',
    owner: 'Sunil Jayawardena',
    location: 'Bandarawela, Uva',
    varieties: ['Dendrobium Orchid', 'Cattleya Hybrid'],
    capacity: '8,500 stems/month',
    submitted: 'Yesterday, 14:30',
    certificateId: 'SL-DOA-FLORA-4481'
  },
  {
    id: 'APP-02',
    grower: 'Hakgala Highland Flora',
    owner: 'Manjula Rajapaksha',
    location: 'Nuwara Eliya, Central',
    varieties: ['Red Naomi Rose', 'Avalanche White Rose'],
    capacity: '12,000 stems/month',
    submitted: '28 Oct 2026',
    certificateId: 'SL-DOA-FLORA-4479'
  },
  {
    id: 'APP-03',
    grower: 'Kandy Mist Carnation Growers',
    owner: 'Dilshan Silva',
    location: 'Galaha, Kandy',
    varieties: ['Standard Carnations', 'Spray Dianthus'],
    capacity: '7,200 stems/month',
    submitted: '27 Oct 2026',
    certificateId: 'SL-DOA-FLORA-4475'
  }
];

// ─── BUSINESS OFFICER DASHBOARD DATA ──────────────────────────────────

export const OFFICER_STATS = [
  {
    id: 'total_orders',
    title: 'Total Orders',
    value: '1,284',
    numericValue: 1284,
    change: '+14.6%',
    isPositive: true,
    subtext: 'This month volume',
    icon: 'ShoppingBag'
  },
  {
    id: 'pending_orders',
    title: 'Pending Orders',
    value: '23',
    numericValue: 23,
    change: 'Requires Action',
    isPositive: false,
    subtext: 'Awaiting grower dispatch',
    icon: 'Clock'
  },
  {
    id: 'total_flowers',
    title: 'Total Flowers',
    value: '48',
    numericValue: 48,
    change: '+3 new',
    isPositive: true,
    subtext: 'Catalogued varieties',
    icon: 'Layers'
  },
  {
    id: 'available_stock',
    title: 'Available Stock',
    value: '15,420',
    numericValue: 15420,
    change: 'In Warehouse',
    isPositive: true,
    subtext: 'Fresh cut stems',
    icon: 'Flower2'
  },
  {
    id: 'low_stock',
    title: 'Low Stock Items',
    value: '4',
    numericValue: 4,
    change: 'Restock Needed',
    isPositive: false,
    subtext: 'Below safety threshold',
    icon: 'AlertTriangle'
  },
  {
    id: 'total_sales',
    title: 'Total Sales',
    value: 'Rs 6.85M',
    numericValue: 6850000,
    change: '+16.5%',
    isPositive: true,
    subtext: 'Gross revenue this cycle',
    icon: 'TrendingUp'
  }
];

export const OFFICER_MONTHLY_SALES = [
  { month: 'Jun', sales: 4.8, target: 4.5 },
  { month: 'Jul', sales: 5.2, target: 5.0 },
  { month: 'Aug', sales: 6.4, target: 5.8 }, // Wedding peak
  { month: 'Sep', sales: 5.9, target: 5.6 },
  { month: 'Oct', sales: 6.5, target: 6.0 },
  { month: 'Nov', sales: 6.85, target: 6.2 }
];

export const OFFICER_ORDER_TRENDS = [
  { day: 'Mon', wholesale: 48, retail: 32 },
  { day: 'Tue', wholesale: 62, retail: 41 },
  { day: 'Wed', wholesale: 55, retail: 38 },
  { day: 'Thu', wholesale: 78, retail: 49 },
  { day: 'Fri', wholesale: 94, retail: 68 }, // Weekend prep
  { day: 'Sat', wholesale: 110, retail: 85 },
  { day: 'Sun', wholesale: 65, retail: 52 }
];

export const INVENTORY_DISTRIBUTION = [
  { name: 'Dendrobium Orchids', value: 4800, color: 'var(--pb-rose)' },
  { name: 'Red Naomi Roses', value: 3900, color: 'var(--pb-danger)' },
  { name: 'Stargazer Lilies', value: 2400, color: 'var(--pb-rose-soft)' },
  { name: 'Holland Anthuriums', value: 2100, color: 'var(--pb-gold)' },
  { name: 'Highland Carnations', value: 1400, color: 'var(--pb-plum-soft)' },
  { name: 'Exotic Foliage', value: 820, color: 'var(--pb-leaf)' }
];

export const OFFICER_RECENT_ORDERS = [
  {
    id: 'ORD-8841',
    customer: 'Kingsbury Hotel Banquet Events',
    flower: 'White Dendrobium Orchids',
    quantity: '600 stems',
    amount: 'Rs 150,000',
    deliveryDate: '2026-11-03',
    status: 'PROCESSING'
  },
  {
    id: 'ORD-8840',
    customer: 'Lassana Petals Floral Studio',
    flower: 'Red Naomi Grand Prix Roses',
    quantity: '450 stems',
    amount: 'Rs 112,500',
    deliveryDate: '2026-11-02',
    status: 'IN_TRANSIT'
  },
  {
    id: 'ORD-8839',
    customer: 'Shangri-La Colombo Florist',
    flower: 'Oriental Stargazer Lilies',
    quantity: '250 stems',
    amount: 'Rs 125,000',
    deliveryDate: '2026-11-02',
    status: 'IN_TRANSIT'
  },
  {
    id: 'ORD-8838',
    customer: 'Bloom Floral Decorators Kandy',
    flower: 'Holland Pink Anthuriums',
    quantity: '300 stems',
    amount: 'Rs 75,000',
    deliveryDate: '2026-11-01',
    status: 'DELIVERED'
  },
  {
    id: 'ORD-8837',
    customer: 'Galle Face Hotel Floral Suite',
    flower: 'Burgundy Cattleya Orchids',
    quantity: '180 stems',
    amount: 'Rs 99,000',
    deliveryDate: '2026-11-01',
    status: 'CONFIRMED'
  }
];

export const LOW_STOCK_ALERTS = [
  {
    id: 'LS-01',
    flower: 'White Dendrobium Madame Pompadour',
    category: 'Orchids',
    currentStems: 180,
    minThreshold: 500,
    deficit: 320,
    preferredSupplier: 'Bandarawela Orchid Blooms',
    urgency: 'HIGH'
  },
  {
    id: 'LS-02',
    flower: 'Avalanche Snow White Rose',
    category: 'Cut Roses',
    currentStems: 240,
    minThreshold: 600,
    deficit: 360,
    preferredSupplier: 'Hakgala Highland Flora',
    urgency: 'HIGH'
  },
  {
    id: 'LS-03',
    flower: 'Tropical Orange Anthurium',
    category: 'Anthuriums',
    currentStems: 150,
    minThreshold: 350,
    deficit: 200,
    preferredSupplier: 'Gampaha Tropical Anthuriums',
    urgency: 'MEDIUM'
  },
  {
    id: 'LS-04',
    flower: 'Yellow Spray Chrysanthemums',
    category: 'Chrysanthemums',
    currentStems: 310,
    minThreshold: 700,
    deficit: 390,
    preferredSupplier: 'Knuckles Mountain Chrysanthemums',
    urgency: 'MEDIUM'
  }
];

export const PENDING_SUPPLIER_CONFIRMATIONS = [
  {
    id: 'SPC-501',
    supplier: 'Hakgala Highland Flora',
    variety: 'Red Naomi Stems (A-Grade)',
    stemsRequested: 1200,
    scheduledDispatch: 'Tomorrow, 08:00 AM',
    status: 'PENDING_DISPATCH'
  },
  {
    id: 'SPC-502',
    supplier: 'Bandarawela Orchid Blooms',
    variety: 'Purple Sonia Orchids',
    stemsRequested: 850,
    scheduledDispatch: '03 Nov 2026',
    status: 'GROWER_ACCEPTED'
  },
  {
    id: 'SPC-503',
    supplier: 'Welimada Valley Lilies',
    variety: 'Yellow Siberia Lilies',
    stemsRequested: 500,
    scheduledDispatch: '04 Nov 2026',
    status: 'HARVESTING'
  }
];

export const UPCOMING_DELIVERIES = [
  {
    id: 'DEL-201',
    orderId: 'ORD-8839',
    client: 'Shangri-La Colombo',
    destination: 'Colombo 03',
    driver: 'Kamal Bandara (Truck #PB-04)',
    eta: 'Today, 02:30 PM',
    status: 'ON_ROUTE',
    dispatchLocation: 'Main Warehouse Bay 1'
  },
  {
    id: 'DEL-202',
    orderId: 'ORD-8840',
    client: 'Lassana Petals Studio',
    destination: 'Nawala, Rajagiriya',
    driver: 'Sunil Fonseka (Van #PB-02)',
    eta: 'Today, 04:15 PM',
    status: 'LOADING',
    dispatchLocation: 'Main Warehouse Bay 2'
  },
  {
    id: 'DEL-203',
    orderId: 'ORD-8841',
    client: 'Kingsbury Banquet Events',
    destination: 'Janadhipathi Mawatha',
    driver: 'Kamal Bandara (Truck #PB-04)',
    eta: 'Tomorrow, 09:00 AM',
    status: 'SCHEDULED',
    dispatchLocation: 'Central Dispatch Hub'
  }
];

export const OFFICER_RECENT_ACTIVITIES = [
  {
    id: 'OACT-01',
    time: '12 mins ago',
    title: 'Stock Sourcing Dispatched',
    desc: 'Sent reorder batch PO #PO-991 to Hakgala Highland Flora for 1,200 Red Naomi roses.'
  },
  {
    id: 'OACT-02',
    time: '45 mins ago',
    title: 'Order Matched with Nuwara Eliya Farm Hub',
    desc: 'Matched wholesale wedding bouquet order #ORD-8841 with available high-grade Dendrobium stock.'
  },
  {
    id: 'OACT-03',
    time: '2 hours ago',
    title: 'Quality Grade Verified',
    desc: 'Batch #B-8422 from Welimada Valley certified Grade A export standard.'
  },
  {
    id: 'OACT-04',
    time: '4 hours ago',
    title: 'Warehouse Inventory Inspection Logged',
    desc: 'Bay 2 humidity and ventilation inspected with optimal freshness parameters.'
  }
];

// ─── SYSTEM NOTIFICATIONS (Shared / Header) ──────────────────────────

export const SYSTEM_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    title: 'New Supplier Registration',
    message: 'Bandarawela Orchid Blooms applied for commercial grower verification.',
    time: '18 mins ago',
    read: false,
    type: 'supplier'
  },
  {
    id: 'NOTIF-02',
    title: 'Low Stock Critical Warning',
    message: 'White Dendrobium orchids fell below 200 stems in central warehouse.',
    time: '45 mins ago',
    read: false,
    type: 'stock'
  },
  {
    id: 'NOTIF-03',
    title: 'Wholesale Delivery Dispatched',
    message: 'Truck PB-04 en route to Colombo Luxury Hotels with 1,300 fresh stems.',
    time: '2 hours ago',
    read: true,
    type: 'logistics'
  },
  {
    id: 'NOTIF-04',
    title: 'Daily AI Forecast Ready',
    message: 'Machine Learning demand model predicts 28% spike in roses for next weekend.',
    time: '5 hours ago',
    read: true,
    type: 'ml'
  }
];

