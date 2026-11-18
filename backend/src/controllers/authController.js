const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User, Customer, Supplier, BusinessOfficer } = require('../models');

// ─── Register ────────────────────────────────────────────────
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['CUSTOMER', 'SUPPLIER']).withMessage('Role must be CUSTOMER or SUPPLIER'),
];

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address, contact_number } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const status = role === 'SUPPLIER' ? 'PENDING' : 'ACTIVE';

    const user = await User.create({ name, email, password_hash, phone, role, status });

    if (role === 'CUSTOMER') {
      await Customer.create({ customer_id: user.user_id, address });
    } else if (role === 'SUPPLIER') {
      await Supplier.create({ supplier_id: user.user_id, address, contact_number, is_approved: false });
    }

    return res.status(201).json({ success: true, message: 'Registration successful.', userId: user.user_id });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ─── Login ───────────────────────────────────────────────────
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.status === 'PENDING') {
      return res.status(403).json({ success: false, message: 'Account pending approval.' });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({ success: false, message: 'Account has been rejected.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ─── Get profile ─────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, registerValidation, login, loginValidation, getProfile };
