const { Supplier, User } = require('../models');

// GET /api/suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      include: [{ model: User, as: 'user', attributes: ['user_id', 'name', 'email', 'phone', 'is_active'] }],
      order: [['supplier_id', 'ASC']],
    });
    return res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching suppliers.' });
  }
};

// POST /api/suppliers (Register new supplier profile)
const createSupplier = async (req, res) => {
  try {
    const { supplier_name, contact_number, city, address, monthly_capacity } = req.body;

    // Create user record or link to current user
    let user_id = req.user.user_id;
    if (req.user.role === 'ADMIN' || req.user.role === 'BUSINESS_OFFICER') {
      const newUser = await User.create({
        name: supplier_name,
        email: `supplier_${Date.now()}@petalio.lk`,
        password_hash: '$2b$10$placeholder_hash',
        phone: contact_number,
        role: 'SUPPLIER',
        is_active: true,
      });
      user_id = newUser.user_id;
    }

    const supplier = await Supplier.create({
      supplier_id: user_id,
      supplier_name,
      contact_number,
      city: city || 'Nuwara Eliya',
      address,
      monthly_capacity: monthly_capacity || 15000,
      is_approved: true,
    });

    return res.status(201).json({ success: true, message: 'Supplier registered successfully.', data: supplier });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || 'Server error creating supplier.' });
  }
};

// PATCH /api/suppliers/:id/approval
const updateSupplierApproval = async (req, res) => {
  try {
    const { is_approved } = req.body;
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found.' });

    await supplier.update({ is_approved });
    return res.json({ success: true, message: 'Supplier approval updated.', data: supplier });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating supplier approval.' });
  }
};

module.exports = {
  getAllSuppliers,
  createSupplier,
  updateSupplierApproval,
};
