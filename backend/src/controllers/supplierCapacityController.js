const { SupplierCapacity, Flower, User } = require('../models');
const { body } = require('express-validator');

const capacityValidation = [
  body('flower_id').isInt().withMessage('Valid flower_id required'),
  body('declared_quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('harvest_date').isDate().withMessage('Valid harvest date required'),
];

// GET /api/supplier-capacity
const getAllCapacity = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'SUPPLIER') where.supplier_id = req.user.user_id;
    if (req.query.status) where.status = req.query.status;

    const capacities = await SupplierCapacity.findAll({
      where,
      include: [
        { model: Flower, as: 'flower' },
        { model: User, as: 'supplier', attributes: ['user_id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return res.json({ success: true, data: capacities });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/supplier-capacity
const createCapacity = async (req, res) => {
  try {
    const { flower_id, declared_quantity, harvest_date } = req.body;
    const supplier_id = req.user.user_id;

    const capacity = await SupplierCapacity.create({
      supplier_id, flower_id, declared_quantity, harvest_date, status: 'AVAILABLE',
    });
    return res.status(201).json({ success: true, message: 'Capacity declared.', data: capacity });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/supplier-capacity/:id/status
const updateCapacityStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const capacity = await SupplierCapacity.findByPk(req.params.id);
    if (!capacity) return res.status(404).json({ success: false, message: 'Capacity record not found.' });
    await capacity.update({ status });
    return res.json({ success: true, message: 'Status updated.', data: capacity });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllCapacity, createCapacity, updateCapacityStatus, capacityValidation };
