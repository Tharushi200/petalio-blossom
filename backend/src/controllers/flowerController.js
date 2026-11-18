const { Flower, Inventory } = require('../models');
const { body } = require('express-validator');
const { Op } = require('sequelize');

const flowerValidation = [
  body('name').notEmpty().withMessage('Flower name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
];

// GET /api/flowers
const getAllFlowers = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (category) where.category = category;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Flower.findAndCountAll({
      where,
      include: [{ model: Inventory, as: 'inventory' }],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/flowers/:id
const getFlowerById = async (req, res) => {
  try {
    const flower = await Flower.findByPk(req.params.id, {
      include: [
        { model: Inventory, as: 'inventory' },
      ],
    });
    if (!flower) return res.status(404).json({ success: false, message: 'Flower not found.' });
    return res.json({ success: true, data: flower });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/flowers
const createFlower = async (req, res) => {
  try {
    const { name, category, unit_price, color, description, initial_stock = 0, reorder_level = 100 } = req.body;
    const flower = await Flower.create({ name, category, unit_price, color, description });
    await Inventory.create({ flower_id: flower.flower_id, stock_quantity: initial_stock, reorder_level });
    return res.status(201).json({ success: true, message: 'Flower created.', data: flower });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/flowers/:id
const updateFlower = async (req, res) => {
  try {
    const flower = await Flower.findByPk(req.params.id);
    if (!flower) return res.status(404).json({ success: false, message: 'Flower not found.' });
    await flower.update(req.body);
    return res.json({ success: true, message: 'Flower updated.', data: flower });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/flowers/:id
const deleteFlower = async (req, res) => {
  try {
    const flower = await Flower.findByPk(req.params.id);
    if (!flower) return res.status(404).json({ success: false, message: 'Flower not found.' });
    
    // Safely delete associated inventory or forecast records
    const { DemandForecast } = require('../models');
    await Inventory.destroy({ where: { flower_id: req.params.id } });
    if (DemandForecast) {
      await DemandForecast.destroy({ where: { flower_id: req.params.id } });
    }
    await flower.destroy();
    return res.json({ success: true, message: 'Flower deleted successfully.' });
  } catch (error) {
    console.error('Error deleting flower:', error);
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { getAllFlowers, getFlowerById, createFlower, updateFlower, deleteFlower, flowerValidation };
