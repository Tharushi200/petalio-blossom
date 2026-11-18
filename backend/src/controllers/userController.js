const { User, Supplier } = require('../models');

// GET /api/users - Admin only
const getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const where = {};
    if (role)   where.role   = role;
    if (status) where.status = status;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/users/:id/status - Admin approve/reject supplier
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.update({ status });

    // If supplier is approved, update is_approved flag
    if (user.role === 'SUPPLIER' && status === 'APPROVED') {
      await Supplier.update({ is_approved: true }, { where: { supplier_id: user.user_id } });
    }

    return res.json({ success: true, message: `User status updated to ${status}.`, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/users/:id - Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await user.destroy();
    return res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllUsers, getUserById, updateUserStatus, deleteUser };
