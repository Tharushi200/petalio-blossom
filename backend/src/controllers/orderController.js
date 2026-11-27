const { Order, OrderItem, Flower, Inventory, Invoice, User } = require('../models');
const { body } = require('express-validator');
const { sequelize } = require('../config/database');

const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.flower_id').isInt().withMessage('Valid flower_id required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const where = {};
    // Customers can only see their own orders
    if (req.user.role === 'CUSTOMER') where.customer_id = req.user.user_id;

    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Flower, as: 'flower' }] },
        { model: User, as: 'customer', attributes: ['user_id', 'name', 'email'] },
      ],
      order: [['order_date', 'DESC']],
    });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Flower, as: 'flower' }] },
        { model: User, as: 'customer', attributes: ['user_id', 'name', 'email', 'phone'] },
        { model: Invoice, as: 'invoice' },
      ],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Customers can only view their own orders
    if (req.user.role === 'CUSTOMER' && order.customer_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/orders
const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, customer_id: requestedCustomerId } = req.body;
    const customer_id = req.user.role === 'CUSTOMER' ? req.user.user_id : (requestedCustomerId || req.user.user_id);

    let total_amount = 0;
    const processedItems = [];

    for (const item of items) {
      const flower = await Flower.findByPk(item.flower_id, { transaction: t });
      if (!flower) {
        await t.rollback();
        return res.status(404).json({ success: false, message: `Flower ${item.flower_id} not found.` });
      }

      const inventory = await Inventory.findOne({ where: { flower_id: item.flower_id }, transaction: t });
      if (!inventory || inventory.stock_quantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Insufficient stock for ${flower.name}.` });
      }

      const lineTotal = parseFloat(flower.unit_price) * item.quantity;
      total_amount += lineTotal;
      processedItems.push({ flower_id: item.flower_id, quantity: item.quantity, price: flower.unit_price });

      await inventory.update({ stock_quantity: inventory.stock_quantity - item.quantity }, { transaction: t });
    }

    const order = await Order.create({
      order_code: `ORD-${Date.now().toString().slice(-4)}`,
      customer_id,
      officer_id: req.user.role === 'BUSINESS_OFFICER' ? req.user.user_id : null,
      season_event: req.body.season_event || 'Normal',
      delivery_address: req.body.delivery_address || null,
      delivery_city: req.body.delivery_city || 'Colombo',
      payment_status: req.body.payment_status || 'UNPAID',
      status: 'PENDING'
    }, { transaction: t });

    for (const item of processedItems) {
      await OrderItem.create({ order_id: order.order_id, ...item }, { transaction: t });
    }

    // Auto-generate invoice
    await Invoice.create({ order_id: order.order_id, total_amount, tax_amount: 0.00, status: 'UNPAID' }, { transaction: t });

    await t.commit();
    return res.status(201).json({ success: true, message: 'Order placed successfully.', data: { order_id: order.order_id, total_amount } });
  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'MATCHED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    await order.update({ status });
    return res.json({ success: true, message: 'Order status updated.', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrderStatus, orderValidation };
