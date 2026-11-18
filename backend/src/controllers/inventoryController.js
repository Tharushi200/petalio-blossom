const { Inventory, Flower } = require('../models');

// GET /api/inventory
const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{ model: Flower, as: 'flower' }],
      order: [['updated_at', 'DESC']],
    });
    return res.json({ success: true, data: inventory });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/inventory/low-stock
const getLowStockItems = async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { Op } = require('sequelize');

    const lowStock = await Inventory.findAll({
      where: sequelize.literal('stock_quantity <= reorder_level'),
      include: [{ model: Flower, as: 'flower' }],
    });
    return res.json({ success: true, data: lowStock });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/inventory/:flower_id
const updateStock = async (req, res) => {
  try {
    const { stock_quantity, reorder_level } = req.body;
    const inventory = await Inventory.findOne({ where: { flower_id: req.params.flower_id } });
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory record not found.' });

    const updates = {};
    if (stock_quantity !== undefined) updates.stock_quantity = stock_quantity;
    if (reorder_level  !== undefined) updates.reorder_level  = reorder_level;

    await inventory.update(updates);
    return res.json({ success: true, message: 'Inventory updated.', data: inventory });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllInventory, getLowStockItems, updateStock };
