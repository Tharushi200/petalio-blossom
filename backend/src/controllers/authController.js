const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body } = require('express-validator');
const { User, Customer, Supplier, BusinessOfficer } = require('../models');

// ─── Email Transporter (Gmail) ───────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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

// ─── Forgot Password ──────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ where: { email } });
    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    // Generate secure token (valid 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({ reset_token: token, reset_token_expiry: expiry });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Petalio Blossom 🌸" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset – Petalio Blossom',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f0e0e8;">
          <div style="background: linear-gradient(135deg, #be185d, #831843); padding: 28px 32px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 1.5rem; letter-spacing: -0.02em;">🌸 Petalio Blossom</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 0.88rem;">Highland Floriculture Management System</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #831843; margin: 0 0 12px; font-size: 1.2rem;">Password Reset Request</h2>
            <p style="color: #555; line-height: 1.6; margin: 0 0 20px;">
              Hello <strong>${user.name}</strong>,<br/>
              We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="background: #be185d; color: #fff; padding: 13px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.95rem; display: inline-block;">
                🔑 Reset My Password
              </a>
            </div>
            <p style="color: #888; font-size: 0.8rem; line-height: 1.6; margin: 24px 0 0;">
              If you did not request a password reset, please ignore this email — your password will remain unchanged.<br/>
              <br/>
              Or copy this link: <a href="${resetLink}" style="color: #be185d; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
          <div style="background: #fdf2f8; padding: 16px 32px; text-align: center; border-top: 1px solid #f0e0e8;">
            <p style="color: #aaa; font-size: 0.75rem; margin: 0;">© 2026 Petalio Blossom · Nuwara Eliya, Sri Lanka</p>
          </div>
        </div>
      `,
    });

    return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again.' });
  }
};

// ─── Reset Password ───────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || user.reset_token !== token) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
    }

    if (!user.reset_token_expiry || new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ success: false, message: 'Reset link has expired. Please request a new one.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await user.update({ password_hash, reset_token: null, reset_token_expiry: null });

    return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
};

module.exports = { register, registerValidation, login, loginValidation, getProfile, forgotPassword, resetPassword };
