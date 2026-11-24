// ============================================================
// Models Index - All Sequelize Models & Associations
// Petalio Blossom Backend
// ============================================================
const { sequelize } = require('../config/database');

const User = require('./User');
const Customer = require('./Customer');
const Supplier = require('./Supplier');
const BusinessOfficer = require('./BusinessOfficer');
const Flower = require('./Flower');
const Inventory = require('./Inventory');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const PlaceOrder = require('./PlaceOrder');
const SupplierPlaceOrder = require('./SupplierPlaceOrder');
const SupplierCapacity = require('./SupplierCapacity');
const Delivery = require('./Delivery');
const Invoice = require('./Invoice');
const Payment = require('./Payment');
const SupplierPayment = require('./SupplierPayment');
const Expense = require('./Expense');
const RatingReview = require('./RatingReview');
const Notification = require('./Notification');
const DemandForecast = require('./DemandForecast');

// ─── Associations ────────────────────────────────────────────

// User → Profile tables (1:1)
User.hasOne(Customer, { foreignKey: 'customer_id', as: 'customerProfile' });
User.hasOne(Supplier, { foreignKey: 'supplier_id', as: 'supplierProfile' });
User.hasOne(BusinessOfficer, { foreignKey: 'officer_id', as: 'officerProfile' });

Customer.belongsTo(User, { foreignKey: 'customer_id', as: 'user' });
Supplier.belongsTo(User, { foreignKey: 'supplier_id', as: 'user' });
BusinessOfficer.belongsTo(User, { foreignKey: 'officer_id', as: 'user' });

// Flower → Inventory (1:1)
Flower.hasOne(Inventory, { foreignKey: 'flower_id', as: 'inventory' });
Inventory.belongsTo(Flower, { foreignKey: 'flower_id', as: 'flower' });

// User → Orders (1:many)
User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// Order → OrderItems (1:many)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Flower, { foreignKey: 'flower_id', as: 'flower' });
Flower.hasMany(OrderItem, { foreignKey: 'flower_id', as: 'orderItems' });

// Supplier → SupplierCapacity (1:many)
User.hasMany(SupplierCapacity, { foreignKey: 'supplier_id', as: 'capacities' });
SupplierCapacity.belongsTo(User, { foreignKey: 'supplier_id', as: 'supplier' });
SupplierCapacity.belongsTo(Flower, { foreignKey: 'flower_id', as: 'flower' });
Flower.hasMany(SupplierCapacity, { foreignKey: 'flower_id', as: 'capacities' });

// Supplier ↔ PlaceOrder Many-to-Many via SupplierPlaceOrder
User.belongsToMany(PlaceOrder, {
  through: SupplierPlaceOrder,
  foreignKey: 'supplier_id',
  otherKey: 'place_order_id',
  as: 'procurementOrders'
});
PlaceOrder.belongsToMany(User, {
  through: SupplierPlaceOrder,
  foreignKey: 'place_order_id',
  otherKey: 'supplier_id',
  as: 'suppliers'
});
PlaceOrder.belongsTo(Inventory, { foreignKey: 'inventory_id', as: 'inventory' });
Inventory.hasMany(PlaceOrder, { foreignKey: 'inventory_id', as: 'placeOrders' });

// Order → Delivery (1:1)
Order.hasOne(Delivery, { foreignKey: 'order_id', as: 'delivery' });
Delivery.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Delivery.belongsTo(User, { foreignKey: 'business_officer_id', as: 'officer' });

// Order → Invoice (1:1)
Order.hasOne(Invoice, { foreignKey: 'order_id', as: 'invoice' });
Invoice.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Invoice → Payments (1:many)
Invoice.hasMany(Payment, { foreignKey: 'invoice_id', as: 'payments' });
Payment.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

// Supplier → SupplierPayments (1:many)
User.hasMany(SupplierPayment, { foreignKey: 'supplier_id', as: 'supplierPayments' });
SupplierPayment.belongsTo(User, { foreignKey: 'supplier_id', as: 'supplier' });

// BusinessOfficer → Expenses (1:many)
User.hasMany(Expense, { foreignKey: 'officer_id', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'officer_id', as: 'officer' });

// Customer → Reviews (1:many)
User.hasMany(RatingReview, { foreignKey: 'customer_id', as: 'reviews' });
RatingReview.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
RatingReview.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
RatingReview.belongsTo(Flower, { foreignKey: 'flower_id', as: 'flower' });
Order.hasMany(RatingReview, { foreignKey: 'order_id', as: 'reviews' });
Flower.hasMany(RatingReview, { foreignKey: 'flower_id', as: 'reviews' });

// User → Notifications (1:many)
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Flower → DemandForecasts (1:many)
Flower.hasMany(DemandForecast, { foreignKey: 'flower_id', as: 'forecasts' });
DemandForecast.belongsTo(Flower, { foreignKey: 'flower_id', as: 'flower' });

module.exports = {
  sequelize,
  User,
  Customer,
  Supplier,
  BusinessOfficer,
  Flower,
  Inventory,
  Order,
  OrderItem,
  PlaceOrder,
  SupplierPlaceOrder,
  SupplierCapacity,
  Delivery,
  Invoice,
  Payment,
  SupplierPayment,
  Expense,
  RatingReview,
  Notification,
  DemandForecast,
};
