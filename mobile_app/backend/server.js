const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const os = require('os');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static flower images
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'public/images')));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Petalio Blossom Backend REST API',
    database: 'petalio_blossom',
    time: new Date().toISOString()
  });
});

// Auto-initialize required tables and columns if they do not exist
async function initDatabaseTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS floral_reminders (
        reminder_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        occasion_title VARCHAR(120) NOT NULL,
        occasion_date VARCHAR(50) NOT NULL,
        bouquet_preset VARCHAR(120) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('🌸 MySQL table floral_reminders is ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS supplier_flowers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_user_id INT NOT NULL,
        flower_id INT NOT NULL,
        flower_name VARCHAR(120) NOT NULL,
        supply_capacity INT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('🌸 MySQL table supplier_flowers is ready');

    // Add columns if they do not exist on existing tables
    try {
      await pool.query('ALTER TABLE supplier_flowers ADD COLUMN supplier_user_id INT DEFAULT 3');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE supplier_flowers ADD COLUMN flower_name VARCHAR(120) DEFAULT ""');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE supplier_flowers ADD COLUMN supply_capacity INT DEFAULT 100');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE supplier_flowers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    } catch (_) {}

    try {
      await pool.query('ALTER TABLE orders ADD COLUMN supplier_id INT DEFAULT NULL');
      await pool.query('UPDATE orders SET supplier_id = 3 WHERE supplier_id IS NULL');
    } catch (_) {
      try {
        const [supOrdCnt] = await pool.query('SELECT COUNT(*) AS c FROM orders WHERE supplier_id IS NOT NULL');
        if (Number(supOrdCnt[0]?.c || 0) === 0) {
          await pool.query('UPDATE orders SET supplier_id = 3 WHERE supplier_id IS NULL');
        }
      } catch (__) {}
    }
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN fulfilment_status VARCHAR(50) DEFAULT "Preparing"');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE flowers ADD COLUMN supplier_id INT DEFAULT NULL');
      await pool.query('UPDATE flowers SET supplier_id = 3 WHERE supplier_id IS NULL');
    } catch (_) {
      try {
        const [supFlCnt] = await pool.query('SELECT COUNT(*) AS c FROM flowers WHERE supplier_id IS NOT NULL');
        if (Number(supFlCnt[0]?.c || 0) === 0) {
          await pool.query('UPDATE flowers SET supplier_id = 3 WHERE supplier_id IS NULL');
        }
      } catch (__) {}
    }
    try {
      await pool.query('ALTER TABLE flowers ADD COLUMN stock_quantity INT DEFAULT 100');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE supplier_payments ADD COLUMN supplier_id INT DEFAULT NULL');
      await pool.query('UPDATE supplier_payments SET supplier_id = 3 WHERE supplier_id IS NULL');
    } catch (_) {
      try {
        const [spCnt] = await pool.query('SELECT COUNT(*) AS c FROM supplier_payments WHERE supplier_id IS NOT NULL');
        if (Number(spCnt[0]?.c || 0) === 0) {
          await pool.query('UPDATE supplier_payments SET supplier_id = 3 WHERE supplier_id IS NULL');
        }
      } catch (__) {}
    }

    try {
      await pool.query('ALTER TABLE customers ADD COLUMN redeemed_points INT DEFAULT 0');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE customers ADD COLUMN bonus_wallet DECIMAL(10,2) DEFAULT 0');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE users ADD COLUMN redeemed_points INT DEFAULT 0');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE users ADD COLUMN bonus_wallet DECIMAL(10,2) DEFAULT 0');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL');
    } catch (_) {
      try {
        await pool.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL');
      } catch (__) {}
    }
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL');
    } catch (_) {
      try {
        await pool.query('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL');
      } catch (__) {}
    }
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS loyalty_redemptions (
          redemption_id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT NOT NULL,
          points_redeemed INT NOT NULL DEFAULT 500,
          wallet_credited DECIMAL(10,2) NOT NULL DEFAULT 500.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (_) {}

    try {
      await pool.query('ALTER TABLE suppliers ADD COLUMN supplier_code VARCHAR(30) DEFAULT NULL');
    } catch (_) {}
    try {
      await pool.query("UPDATE suppliers SET supplier_code = CONCAT('SUP-2026-', LPAD(supplier_id, 4, '0')) WHERE supplier_code IS NULL OR supplier_code = ''");
    } catch (_) {}

    try {
      await pool.query('ALTER TABLE rating_reviews ADD COLUMN flower_id INT DEFAULT NULL');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE rating_reviews ADD COLUMN customer_id INT DEFAULT NULL');
    } catch (_) {}
    try {
      await pool.query(
        UPDATE rating_reviews rr 
        JOIN order_items oi ON rr.order_id = oi.order_id 
        SET rr.flower_id = oi.flower_id 
        WHERE rr.flower_id IS NULL
      );
    } catch (_) {}
    try {
      await pool.query(
        UPDATE rating_reviews rr 
        JOIN orders o ON rr.order_id = o.order_id 
        SET rr.customer_id = o.customer_id 
        WHERE rr.customer_id IS NULL
      );
    } catch (_) {}

    try {
      await pool.query('ALTER TABLE deliveries ADD COLUMN vehicle_number VARCHAR(50) DEFAULT "WP CAD-4521"');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE deliveries ADD COLUMN driver_name VARCHAR(100) DEFAULT "Sunil Shantha"');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE deliveries ADD COLUMN driver_phone VARCHAR(20) DEFAULT "+94 77 123 4567"');
    } catch (_) {}

    try {
      await pool.query('ALTER TABLE invoices ADD COLUMN customer_name VARCHAR(120) DEFAULT NULL');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE invoices ADD COLUMN invoice_number VARCHAR(50) DEFAULT NULL');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE deliveries ADD COLUMN destination_address VARCHAR(255) DEFAULT NULL');
    } catch (_) {}
    try {
      await pool.query('ALTER TABLE deliveries MODIFY COLUMN business_officer_id INT NULL DEFAULT 2');
    } catch (_) {}

    try {
      await pool.query("UPDATE orders SET fulfilment_status = 'Pending' WHERE UPPER(status) = 'PENDING'");
    } catch (_) {}
    try {
      await pool.query("UPDATE orders SET fulfilment_status = 'Delivered' WHERE UPPER(status) = 'DELIVERED' AND (fulfilment_status IS NULL OR UPPER(fulfilment_status) != 'DELIVERED')");
    } catch (_) {}
    try {
      await pool.query("UPDATE orders SET fulfilment_status = 'Cancelled' WHERE UPPER(status) = 'CANCELLED' AND (fulfilment_status IS NULL OR UPPER(fulfilment_status) != 'CANCELLED')");
    } catch (_) {}
    try {
      await pool.query("UPDATE orders SET fulfilment_status = 'Dispatched' WHERE UPPER(status) = 'SHIPPED' AND (fulfilment_status IS NULL OR UPPER(fulfilment_status) != 'DISPATCHED')");
    } catch (_) {}
    try {
      await pool.query("UPDATE deliveries d JOIN orders o ON d.order_id = o.order_id SET d.status = 'DELIVERED' WHERE UPPER(o.status) = 'DELIVERED' AND d.status != 'DELIVERED'");
    } catch (_) {}

  } catch (err) {
    console.error('Error initializing tables:', err.message);
  }
}
initDatabaseTables();

/* ==========================================================
   1. AUTHENTICATION & USERS (Database Bcrypt Verification)
   ========================================================== */

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
const cleanPhoneDigits = (phone) => String(phone || '').replace(/[\s-]/g, '');
const isValidPhone = (phone) => /^(\+94|0)[0-9]{9}$/.test(cleanPhoneDigits(phone));

const escapeHtml = (val) => String(val || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

function createSmtpTransporter() {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  // Strip spaces so 16-char Google App Passwords pasted with spaces work seamlessly
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  if (!smtpUser || !smtpPass) return null;

  const smtpHost = (process.env.SMTP_HOST || '').trim();
  if (smtpHost) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    return nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });
  }

  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: { user: smtpUser, pass: smtpPass }
  });
}

function resolveResetBaseUrl(req) {
  const explicit = (process.env.RESET_BASE_URL || '').trim().replace(/\/+$/, '');
  if (explicit) return explicit;

  const reqHost = (req.get('host') || '').trim();
  const isLoopbackHost = /^(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?$/i.test(reqHost);
  if (reqHost && !isLoopbackHost) {
    return `${req.protocol}://${reqHost}`;
  }
  return `http://localhost:${PORT}`;
}

function buildResetEmailHtml({ name, resetLink }) {
  const displayName = escapeHtml(name || 'Valued Guest');
  const safeUrl = escapeHtml(resetLink);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Petalio Blossom Password</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E191B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#FFFFFF;border-radius:18px;border:1px solid #F0DCE2;overflow:hidden;box-shadow:0 8px 24px rgba(139,30,63,0.08);">
          <tr>
            <td style="background:#FDF2F5;padding:28px 32px;text-align:center;border-bottom:1px solid #F0DCE2;">
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#8B1E3F;text-transform:uppercase;">PETALIO BLOSSOM</div>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#1E191B;">Password Reset Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hello <strong>${displayName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6E6266;">
                We received a request to reset your Petalio Blossom account password. Tap the button below to choose a new password. This link will expire in <strong>15 minutes</strong>.
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${safeUrl}" style="display:inline-block;background:#8B1E3F;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;">
                  Reset My Password
                </a>
              </div>
              <p style="margin:24px 0 8px;font-size:12px;color:#6E6266;">If the button doesn't open automatically, copy and paste this URL into your browser:</p>
              <p style="margin:0 0 20px;font-size:12px;word-break:break-all;color:#8B1E3F;">${safeUrl}</p>
              <hr style="border:none;border-top:1px solid #F0DCE2;margin:20px 0;" />
              <p style="margin:0;font-size:12px;color:#A89DA1;">If you did not request a password reset, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildResetPageHtml({ valid, email, token, errorMessage }) {
  const safeEmail = escapeHtml(email || '');
  const safeToken = JSON.stringify(String(token || ''));
  const safeErr = escapeHtml(errorMessage || 'This password reset link is invalid or has expired.');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Petalio Blossom — Reset Password</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: linear-gradient(160deg, #FDF2F5 0%, #FAF7F6 60%, #F7EBEE 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E191B;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      width: 100%;
      max-width: 440px;
      background: #FFFFFF;
      border-radius: 22px;
      border: 1px solid #F0DCE2;
      box-shadow: 0 18px 40px rgba(139, 30, 63, 0.10);
      overflow: hidden;
    }
    .header {
      background: #8B1E3F;
      color: #FFFFFF;
      padding: 28px 28px 24px;
      text-align: center;
    }
    .eyebrow {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      opacity: 0.88;
    }
    .header h1 {
      margin: 8px 0 4px;
      font-size: 22px;
      font-weight: 700;
    }
    .header p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }
    .body {
      padding: 28px;
    }
    .account-pill {
      background: #FDF2F5;
      border: 1px solid #F0DCE2;
      color: #8B1E3F;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      word-break: break-all;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #1E191B;
      margin-bottom: 6px;
    }
    input[type="password"] {
      width: 100%;
      padding: 13px 14px;
      border: 1.5px solid #E2CBD2;
      border-radius: 12px;
      font-size: 15px;
      outline: none;
      margin-bottom: 16px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    input[type="password"]:focus {
      border-color: #8B1E3F;
      box-shadow: 0 0 0 3px rgba(139, 30, 63, 0.12);
    }
    .btn {
      width: 100%;
      padding: 14px 20px;
      border: none;
      border-radius: 12px;
      background: #8B1E3F;
      color: #FFFFFF;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .btn:hover { background: #731733; }
    .btn:disabled { opacity: 0.65; cursor: not-allowed; }
    .alert {
      display: none;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
      line-height: 1.45;
    }
    .alert.error {
      display: block;
      background: #FEF2F2;
      color: #B91C1C;
      border: 1px solid #FECACA;
    }
    .state-box {
      text-align: center;
      padding: 10px 4px;
    }
    .badge-icon {
      width: 56px;
      height: 56px;
      line-height: 56px;
      border-radius: 50%;
      margin: 0 auto 14px;
      font-size: 24px;
      font-weight: 700;
    }
    .badge-success { background: #DCFCE7; color: #15803D; }
    .badge-error { background: #FEF2F2; color: #DC2626; }
    .state-box h2 { margin: 0 0 8px; font-size: 20px; color: #1E191B; }
    .state-box p { margin: 0; font-size: 14px; color: #6E6266; line-height: 1.55; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="eyebrow">Petalio Blossom</div>
      <h1>Reset Your Password</h1>
      <p>Luxury Floriculture Account Security</p>
    </div>
    <div class="body">
      ${valid ? `
      <div id="formContainer">
        <div class="account-pill">Account: ${safeEmail}</div>
        <div id="errorBanner" class="alert"></div>
        <form id="resetForm">
          <label for="newPassword">New Password</label>
          <input type="password" id="newPassword" name="new_password" placeholder="At least 6 characters" minlength="6" required autocomplete="new-password" />

          <label for="confirmPassword">Confirm New Password</label>
          <input type="password" id="confirmPassword" name="confirm_password" placeholder="Re-enter your new password" minlength="6" required autocomplete="new-password" />

          <button type="submit" id="submitBtn" class="btn">Update Password</button>
        </form>
      </div>
      <div id="successContainer" class="state-box" style="display:none;">
        <div class="badge-icon badge-success">&#10003;</div>
        <h2>Password Updated</h2>
        <p>Your Petalio Blossom password has been reset successfully. You can now close this page and sign in from the mobile app.</p>
      </div>
      <script>
        (function() {
          var token = ${safeToken};
          var form = document.getElementById('resetForm');
          var errEl = document.getElementById('errorBanner');
          var btn = document.getElementById('submitBtn');
          function showError(msg) {
            errEl.textContent = msg;
            errEl.className = 'alert error';
          }
          form.addEventListener('submit', async function(e) {
            e.preventDefault();
            errEl.className = 'alert';
            var p1 = document.getElementById('newPassword').value.trim();
            var p2 = document.getElementById('confirmPassword').value.trim();
            if (p1.length < 6) {
              showError('New password must be at least 6 characters.');
              return;
            }
            if (p1 !== p2) {
              showError('Passwords do not match. Please check and try again.');
              return;
            }
            btn.disabled = true;
            btn.textContent = 'Updating Password...';
            try {
              var res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, new_password: p1 })
              });
              var data = await res.json();
              if (!res.ok || !data.success) {
                showError((data && data.message) || 'Could not reset password. The link may have expired.');
                btn.disabled = false;
                btn.textContent = 'Update Password';
                return;
              }
              document.getElementById('formContainer').style.display = 'none';
              document.getElementById('successContainer').style.display = 'block';
            } catch (err) {
              showError('Network error while contacting server. Please try again.');
              btn.disabled = false;
              btn.textContent = 'Update Password';
            }
          });
        })();
      </script>
      ` : `
      <div class="state-box">
        <div class="badge-icon badge-error">&#10005;</div>
        <h2>Invalid or Expired Link</h2>
        <p>${safeErr} Please return to the Petalio Blossom app and request a fresh password reset email.</p>
      </div>
      `}
    </div>
  </div>
</body>
</html>`;
}

// Unified Login (Customer or Supplier)
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  const input = (email || '').trim();
  const inputPassword = (password || '').trim();
  const selectedRole = (role || '').trim().toUpperCase();

  if (!input || !inputPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please enter your email/ID and password.'
    });
  }

  try {
    // 1. Try finding by email, phone, or name (preferring matching role if duplicate)
    let [rows] = await pool.query(
      'SELECT user_id, name, email, password_hash, phone, role, status FROM users WHERE (email = ? OR phone = ? OR name = ?) ORDER BY (UPPER(role) = ?) DESC LIMIT 1',
      [input, input, input, selectedRole || 'CUSTOMER']
    );

    // 2. Try matching supplier_code (e.g. SUP-2026-0003 or custom code)
    if (rows.length === 0) {
      const [supCodeRows] = await pool.query(
        `SELECT u.user_id, u.name, u.email, u.password_hash, u.phone, u.role, u.status
         FROM suppliers s
         JOIN users u ON s.supplier_id = u.user_id
         WHERE LOWER(s.supplier_code) = LOWER(?)
         LIMIT 1`,
        [input]
      );
      rows = supCodeRows;
    }

    // 3. Only if input explicitly looks like a numeric ID or SUP-YYYY-NNNN code
    if (rows.length === 0 && /^(\d+|sup-\d{4}-\d+)$/i.test(input)) {
      const supMatch = input.match(/(\d+)$/);
      const numericId = supMatch ? parseInt(supMatch[1], 10) : NaN;
      if (!isNaN(numericId) && numericId > 0) {
        [rows] = await pool.query(
          'SELECT user_id, name, email, password_hash, phone, role, status FROM users WHERE user_id = ? LIMIT 1',
          [numericId]
        );
      }
    }

    let user = rows.length > 0 ? rows[0] : null;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Account not found for "${input}". Please check your email or register.`
      });
    }

    // 4. Enforce role match when a role tab was explicitly selected
    if (selectedRole && user.role && user.role.toUpperCase() !== selectedRole) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}. Please switch to the ${user.role.toLowerCase()} login tab.`
      });
    }

    // 5. Verify Password strictly against database bcrypt hash
    if (user.password_hash && user.password_hash.trim() !== '') {
      let isMatch = false;
      try {
        isMatch = bcrypt.compareSync(inputPassword, user.password_hash);
      } catch (err) {
        isMatch = false;
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password! Please check your credentials.'
        });
      }
    }

    // Attach Customer / Supplier specific details
    let profileDetails = {};
    if (user.role === 'SUPPLIER') {
      const [supplierRows] = await pool.query('SELECT * FROM suppliers WHERE supplier_id = ?', [user.user_id]);
      if (supplierRows.length > 0) {
        profileDetails = supplierRows[0];
        if (!profileDetails.supplier_code) {
          profileDetails.supplier_code = `SUP-2026-${String(user.user_id).padStart(4, '0')}`;
        }
      } else {
        profileDetails = {
          supplier_id: user.user_id,
          supplier_code: `SUP-2026-${String(user.user_id).padStart(4, '0')}`,
          is_approved: String(user.status || '').toUpperCase() === 'ACTIVE' ? 1 : 0
        };
      }
      const isApprNum = Number(profileDetails.is_approved) === 1 ? 1 : 0;
      profileDetails.is_approved = isApprNum;
      profileDetails.approval_status = isApprNum === 1
        ? 'Approved'
        : (String(user.status || '').toUpperCase() === 'REJECTED' ? 'Rejected' : 'Pending');
    } else {
      const [customerRows] = await pool.query('SELECT * FROM customers WHERE customer_id = ?', [user.user_id]);
      if (customerRows.length > 0) {
        profileDetails = customerRows[0];
      }
      if (!profileDetails.customer_id) {
        profileDetails.customer_id = user.user_id;
      }
    }

    const { password_hash: _omittedHash, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        ...safeUser,
        ...profileDetails
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
});

// Customer Registration
app.post('/api/auth/register-customer', async (req, res) => {
  const { name, email, password, phone, address, city } = req.body;
  const userName = (name || '').trim();
  const userEmail = (email || '').trim().toLowerCase();
  const userPhone = (phone || '').trim();
  const userAddress = address !== undefined ? String(address).trim() : '';
  const userCity = city !== undefined ? String(city).trim() : '';
  const pass = (password || '').trim();

  if (userName.length < 2) {
    return res.status(400).json({ success: false, message: 'Full name (min 2 chars) is required' });
  }
  if (!isValidEmail(userEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }
  if (!isValidPhone(userPhone)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Sri Lankan phone number' });
  }
  if (pass.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query('SELECT user_id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [userEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email is already registered.' });
    }

    const passwordHash = bcrypt.hashSync(pass, 10);
    await conn.beginTransaction();

    const [userRes] = await conn.query(
      'INSERT INTO users (name, email, password_hash, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userName, userEmail, passwordHash, userPhone, 'CUSTOMER', 'ACTIVE']
    );

    const userId = userRes.insertId;
    await conn.query(
      'INSERT INTO customers (customer_id, customer_name, contact_number, address, city) VALUES (?, ?, ?, ?, ?)',
      [userId, userName, userPhone, userAddress, userCity]
    );

    await conn.commit();
    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      user_id: userId,
      customer_id: userId,
      role: 'CUSTOMER',
      name: userName,
      email: userEmail
    });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'An account with this email is already registered.' });
    }
    console.error('Customer Register Error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  } finally {
    conn.release();
  }
});

// Supplier Registration
app.post('/api/auth/register-supplier', async (req, res) => {
  const { farmName, contactPerson, password, phone, farmLocation, email, supplierId, monthly_capacity } = req.body;
  const name = (contactPerson || farmName || '').trim();
  const farmTitle = (farmName || name).trim();
  const supplierEmail = (email || '').trim().toLowerCase();
  const supplierPhone = (phone || '').trim();
  const location = (farmLocation || '').trim();
  const pass = (password || '').trim();
  const initialCapacity = Math.max(0, parseInt(monthly_capacity, 10) || 0);

  if (name.length < 2 || farmTitle.length < 2) {
    return res.status(400).json({ success: false, message: 'Farm name and contact name (min 2 chars) are required' });
  }
  if (!isValidEmail(supplierEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }
  if (!isValidPhone(supplierPhone)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Sri Lankan phone number' });
  }
  if (pass.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query('SELECT user_id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [supplierEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email is already registered.' });
    }

    const passwordHash = bcrypt.hashSync(pass, 10);
    await conn.beginTransaction();

    const [userRes] = await conn.query(
      'INSERT INTO users (name, email, password_hash, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, supplierEmail, passwordHash, supplierPhone, 'SUPPLIER', 'PENDING']
    );

    const userId = userRes.insertId;
    let assignedCode = (supplierId && String(supplierId).trim())
      ? String(supplierId).trim()
      : `SUP-2026-${String(userId).padStart(4, '0')}`;

    const [dupCode] = await conn.query('SELECT supplier_id FROM suppliers WHERE LOWER(supplier_code) = LOWER(?) LIMIT 1', [assignedCode]);
    if (dupCode.length > 0) {
      assignedCode = `SUP-2026-${String(userId).padStart(4, '0')}`;
    }

    await conn.query(
      'INSERT INTO suppliers (supplier_id, supplier_code, supplier_name, contact_number, city, address, monthly_capacity, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, assignedCode, farmTitle, supplierPhone, location, location, initialCapacity, 0]
    );

    await conn.commit();
    return res.status(201).json({
      success: true,
      message: 'Supplier registration submitted and awaiting Admin approval.',
      user_id: userId,
      supplier_id: assignedCode,
      supplier_code: assignedCode,
      farmName: farmTitle,
      is_approved: 0,
      approval_status: 'Pending'
    });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'An account with this email or supplier code already exists.' });
    }
    console.error('Supplier Register Error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  } finally {
    conn.release();
  }
});

// Forgot Password (Generate 32-byte token, 15m expiry, send Nodemailer reset email or console fallback)
app.post('/api/auth/forgot-password', async (req, res) => {
  const inputEmail = String(req.body?.email || '').trim().toLowerCase();

  if (!inputEmail || !isValidEmail(inputEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid registered email address.'
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_id, name, email FROM users WHERE LOWER(email) = ? LIMIT 1',
      [inputEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No account found for "${inputEmail}". Please check your email or register.`
      });
    }

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE user_id = ?',
      [resetToken, user.user_id]
    );

    const resetLink = `${resolveResetBaseUrl(req)}/reset-password?token=${resetToken}`;
    const transporter = createSmtpTransporter();

    if (!transporter) {
      console.log('===================================================');
      console.log('📧 [SMTP NOT CONFIGURED] Password Reset Email Fallback');
      console.log(`   To:        ${user.email} (${user.name})`);
      console.log(`   Reset URL: ${resetLink}`);
      console.log('   Expires:   15 minutes');
      console.log('===================================================');
      return res.json({
        success: true,
        message: `Reset link sent to ${user.email}. Check your inbox and open the link to set a new password.`
      });
    }

    const fromAddress = process.env.SMTP_FROM || `"Petalio Blossom" <${process.env.SMTP_USER}>`;
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: user.email,
        subject: 'Reset Your Petalio Blossom Password',
        text: `Hello ${user.name || ''},\n\nOpen this link to reset your Petalio Blossom password (valid for 15 minutes):\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        html: buildResetEmailHtml({ name: user.name, resetLink })
      });
      console.log(`📧 Password reset email sent via SMTP to ${user.email}`);
      return res.json({
        success: true,
        message: `Reset link sent to ${user.email}. Check your inbox and open the link to set a new password.`
      });
    } catch (mailError) {
      console.error('⚠️ SMTP delivery failed, logging fallback URL:', mailError.message);
      console.log(`📧 [SMTP FALLBACK] Reset URL for ${user.email}: ${resetLink}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email via SMTP. Please check server SMTP configuration.'
      });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process forgot password request', error: error.message });
  }
});

// Hosted HTML Reset Password Form Page
app.get('/reset-password', async (req, res) => {
  const token = String(req.query.token || '').trim();
  if (!token) {
    return res.type('html').send(buildResetPageHtml({
      valid: false,
      errorMessage: 'Reset token is missing from the URL.'
    }));
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_id, name, email FROM users WHERE reset_token = ? AND reset_token_expires IS NOT NULL AND reset_token_expires > NOW() LIMIT 1',
      [token]
    );

    if (rows.length === 0) {
      return res.type('html').send(buildResetPageHtml({
        valid: false,
        errorMessage: 'This password reset link is invalid or has expired (links expire after 15 minutes).'
      }));
    }

    return res.type('html').send(buildResetPageHtml({
      valid: true,
      email: rows[0].email,
      token
    }));
  } catch (error) {
    console.error('GET /reset-password Error:', error);
    return res.status(500).type('html').send(buildResetPageHtml({
      valid: false,
      errorMessage: 'A server error occurred while validating your reset link.'
    }));
  }
});

// Reset Password (Token-based email link flow, plus legacy email+phone compatibility)
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, new_password, email, phone } = req.body || {};
  const cleanToken = String(token || '').trim();
  const newPass = String(new_password || '').trim();

  if (!newPass || newPass.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  // Primary email-link token flow
  if (token !== undefined || (!email && !phone)) {
    if (!cleanToken) {
      return res.status(400).json({ success: false, message: 'Reset token is required.' });
    }

    try {
      const [rows] = await pool.query(
        'SELECT user_id, name, email FROM users WHERE reset_token = ? AND reset_token_expires IS NOT NULL AND reset_token_expires > NOW() LIMIT 1',
        [cleanToken]
      );

      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'This password reset link is invalid or has expired. Please request a new reset link.'
        });
      }

      const user = rows[0];
      const passwordHash = bcrypt.hashSync(newPass, 10);

      await pool.query(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?',
        [passwordHash, user.user_id]
      );

      return res.json({
        success: true,
        message: 'Password reset successfully! You can now sign in with your new password.',
        email: user.email,
        name: user.name
      });
    } catch (error) {
      console.error('Reset Password Error:', error);
      return res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
    }
  }

  // Legacy email + phone verification flow (e.g. SupplierLoginActivity dialog)
  const inputEmail = String(email || '').trim().toLowerCase();
  const inputPhone = String(phone || '').trim();
  if (!inputEmail) {
    return res.status(400).json({ success: false, message: 'Please enter your registered email address.' });
  }
  if (!inputPhone) {
    return res.status(400).json({ success: false, message: 'Please enter your registered phone number.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_id, name, email, phone FROM users WHERE LOWER(email) = ? LIMIT 1',
      [inputEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No account found for "${inputEmail}". Please check your email or create a new account.`
      });
    }

    const user = rows[0];
    const registeredPhoneDigits = (user.phone || '').replace(/\D/g, '').slice(-9);
    const inputPhoneDigits = inputPhone.replace(/\D/g, '').slice(-9);

    if (!registeredPhoneDigits || registeredPhoneDigits !== inputPhoneDigits) {
      return res.status(401).json({
        success: false,
        message: 'The phone number does not match our registered records for this email.'
      });
    }

    const passwordHash = bcrypt.hashSync(newPass, 10);
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?',
      [passwordHash, user.user_id]
    );

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
});

// Get User Profile & Real Stats (Orders count, Total spend, Points)
app.get('/api/users/:userId/profile', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const [userRows] = await pool.query(
      'SELECT user_id, name, email, phone, role, status, redeemed_points, bonus_wallet FROM users WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRows[0];
    let address = '';
    let city = '';
    let redeemedPoints = parseInt(user.redeemed_points, 10) || 0;
    let bonusWallet = parseFloat(user.bonus_wallet) || 0;

    if (user.role === 'SUPPLIER') {
      const [supplierRows] = await pool.query('SELECT address, city FROM suppliers WHERE supplier_id = ?', [userId]);
      if (supplierRows.length > 0) {
        address = supplierRows[0].address || '';
        city = supplierRows[0].city || '';
      }
    } else {
      const [customerRows] = await pool.query('SELECT address, city, redeemed_points, bonus_wallet FROM customers WHERE customer_id = ?', [userId]);
      if (customerRows.length > 0) {
        address = customerRows[0].address || '';
        city = customerRows[0].city || '';
        redeemedPoints = parseInt(customerRows[0].redeemed_points, 10) || 0;
        bonusWallet = parseFloat(customerRows[0].bonus_wallet) || 0;
      }
    }

    // Orders Count & Total Spend from MySQL
    const [orderCountRows] = await pool.query(
      'SELECT COUNT(*) AS total_orders FROM orders WHERE customer_id = ?',
      [userId]
    );
    const totalOrders = orderCountRows[0]?.total_orders || 0;

    const [spendRows] = await pool.query(
      'SELECT COALESCE(SUM(i.total_amount), 0) AS total_spend FROM orders o JOIN invoices i ON o.order_id = i.order_id WHERE o.customer_id = ?',
      [userId]
    );
    const totalSpend = parseFloat(spendRows[0]?.total_spend || 0);

    const loyaltyPoints = Math.max(0, (totalOrders * 50) - redeemedPoints);
    const baseCashback = totalOrders > 0 ? Math.round(totalSpend * 0.05) : 0;
    const walletCredits = baseCashback + Math.round(bonusWallet);
    const savedAddressesCount = address && address.trim().length > 0 ? 1 : 0;

    const profileData = {
      ...user,
      full_name: user.name || '',
      name: user.name || '',
      address: address || '',
      city: city || '',
      saved_addresses_count: savedAddressesCount,
      total_orders: totalOrders,
      order_count: totalOrders,
      total_spend: totalSpend,
      total_spent: totalSpend,
      loyalty_points: loyaltyPoints,
      points: loyaltyPoints,
      wallet_credits: walletCredits,
      wallet_balance: walletCredits,
      redeemed_points: redeemedPoints,
      bonus_wallet: bonusWallet
    };

    return res.json({
      success: true,
      user: profileData,
      profile: profileData
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
});

// GET /api/customers/:customerId/profile - Customer specific profile with live stats
app.get('/api/customers/:customerId/profile', async (req, res) => {
  const customerId = parseInt(req.params.customerId, 10);
  if (isNaN(customerId)) {
    return res.status(400).json({ success: false, message: 'Invalid customer ID' });
  }

  try {
    const [userRows] = await pool.query(
      'SELECT user_id, name, email, phone, role, status FROM users WHERE user_id = ? LIMIT 1',
      [customerId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const user = userRows[0];
    let address = '';
    let city = '';
    let customerName = user.name || '';
    let customerPhone = user.phone || '';
    let redeemedPoints = 0;
    let bonusWallet = 0;

    const [customerRows] = await pool.query(
      'SELECT customer_name, contact_number, address, city, redeemed_points, bonus_wallet FROM customers WHERE customer_id = ?',
      [customerId]
    );
    if (customerRows.length > 0) {
      if (customerRows[0].customer_name) customerName = customerRows[0].customer_name;
      if (customerRows[0].contact_number) customerPhone = customerRows[0].contact_number;
      address = customerRows[0].address || '';
      city = customerRows[0].city || '';
      redeemedPoints = parseInt(customerRows[0].redeemed_points, 10) || 0;
      bonusWallet = parseFloat(customerRows[0].bonus_wallet) || 0;
    } else {
      redeemedPoints = parseInt(user.redeemed_points, 10) || 0;
      bonusWallet = parseFloat(user.bonus_wallet) || 0;
    }

    // Actual order_count from orders table
    const [orderCountRows] = await pool.query(
      'SELECT COUNT(*) AS order_count FROM orders WHERE customer_id = ?',
      [customerId]
    );
    const orderCount = orderCountRows[0]?.order_count || 0;

    // Total spend from invoices
    let totalSpend = 0;
    try {
      const [spendRows] = await pool.query(
        'SELECT COALESCE(SUM(i.total_amount), 0) AS total_spend FROM orders o JOIN invoices i ON o.order_id = i.order_id WHERE o.customer_id = ?',
        [customerId]
      );
      totalSpend = parseFloat(spendRows[0]?.total_spend || 0);
    } catch (_) {}

    // Dynamic loyalty points: Math.max(0, (order_count * 50) - redeemed_points)
    const loyaltyPoints = Math.max(0, (orderCount * 50) - redeemedPoints);
    // Wallet balance: Math.round(total_spend * 0.05) + bonus_wallet
    const baseCashback = orderCount > 0 ? Math.round(totalSpend * 0.05) : 0;
    const walletBalance = baseCashback + Math.round(bonusWallet);
    const savedAddressesCount = address && address.trim().length > 0 ? 1 : 0;

    const profileData = {
      user_id: user.user_id,
      customer_id: user.user_id,
      full_name: customerName,
      name: customerName,
      email: user.email || '',
      phone: customerPhone,
      address: address || '',
      city: city || '',
      saved_addresses_count: savedAddressesCount,
      order_count: orderCount,
      total_orders: orderCount,
      total_spent: totalSpend,
      total_spend: totalSpend,
      points: loyaltyPoints,
      loyalty_points: loyaltyPoints,
      wallet_balance: walletBalance,
      wallet_credits: walletBalance,
      redeemed_points: redeemedPoints,
      bonus_wallet: bonusWallet,
      role: user.role || 'CUSTOMER',
      status: user.status || 'ACTIVE'
    };

    return res.json({
      success: true,
      profile: profileData,
      user: profileData
    });
  } catch (error) {
    console.error('Get Customer Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving customer profile', error: error.message });
  }
});

// POST /api/customers/:customerId/redeem-points - Redeem 500 Bloom Points for Rs. 500 Wallet Credit
app.post(['/api/customers/:customerId/redeem-points', '/api/users/:customerId/redeem-points'], async (req, res) => {
  const customerId = parseInt(req.params.customerId, 10);
  if (isNaN(customerId)) {
    return res.status(400).json({ success: false, message: 'Invalid customer ID' });
  }

  try {
    // 1. Check user exists
    const [userRows] = await pool.query('SELECT user_id, name, email FROM users WHERE user_id = ? LIMIT 1', [customerId]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // 2. Fetch current orders count & existing redemptions
    const [orderCountRows] = await pool.query(
      'SELECT COUNT(*) AS order_count FROM orders WHERE customer_id = ?',
      [customerId]
    );
    const orderCount = orderCountRows[0]?.order_count || 0;

    const [customerRows] = await pool.query(
      'SELECT redeemed_points, bonus_wallet FROM customers WHERE customer_id = ?',
      [customerId]
    );
    let redeemedPoints = 0;
    let bonusWallet = 0;
    if (customerRows.length > 0) {
      redeemedPoints = parseInt(customerRows[0].redeemed_points, 10) || 0;
      bonusWallet = parseFloat(customerRows[0].bonus_wallet) || 0;
    }

    // Available points = Math.max(0, (order_count * 50) - redeemed_points)
    const availablePoints = Math.max(0, (orderCount * 50) - redeemedPoints);

    if (availablePoints < 500) {
      const needed = 500 - availablePoints;
      return res.status(400).json({
        success: false,
        message: `Insufficient Bloom Points. You have ${availablePoints} points. You need ${needed} more points to unlock Rs. 500.`,
        available_points: availablePoints,
        points: availablePoints,
        points_needed: needed
      });
    }

    // 3. Deduct 500 points and add Rs. 500 to bonus_wallet
    const newRedeemedPoints = redeemedPoints + 500;
    const newBonusWallet = bonusWallet + 500.00;

    // Update customers table
    await pool.query(
      'UPDATE customers SET redeemed_points = ?, bonus_wallet = ? WHERE customer_id = ?',
      [newRedeemedPoints, newBonusWallet, customerId]
    );

    // Update users table as well if column exists
    try {
      await pool.query(
        'UPDATE users SET redeemed_points = ?, bonus_wallet = ? WHERE user_id = ?',
        [newRedeemedPoints, newBonusWallet, customerId]
      );
    } catch (_) {}

    // Record in loyalty_redemptions table
    try {
      await pool.query(
        'INSERT INTO loyalty_redemptions (customer_id, points_redeemed, wallet_credited) VALUES (?, ?, ?)',
        [customerId, 500, 500.00]
      );
    } catch (_) {}

    // Calculate total spend for wallet balance
    let totalSpend = 0;
    try {
      const [spendRows] = await pool.query(
        'SELECT COALESCE(SUM(i.total_amount), 0) AS total_spend FROM orders o JOIN invoices i ON o.order_id = i.order_id WHERE o.customer_id = ?',
        [customerId]
      );
      totalSpend = parseFloat(spendRows[0]?.total_spend || 0);
    } catch (_) {}

    const newPoints = Math.max(0, (orderCount * 50) - newRedeemedPoints);
    const baseCashback = orderCount > 0 ? Math.round(totalSpend * 0.05) : 0;
    const newWalletBalance = baseCashback + Math.round(newBonusWallet);

    console.log(`[Loyalty] Customer #${customerId} redeemed 500 points. New Points: ${newPoints}, New Wallet: Rs. ${newWalletBalance}`);

    return res.json({
      success: true,
      message: 'Successfully redeemed 500 Bloom Points for Rs. 500 Wallet Credit!',
      points: newPoints,
      loyalty_points: newPoints,
      wallet_balance: newWalletBalance,
      wallet_credits: newWalletBalance,
      redeemed_points: newRedeemedPoints,
      bonus_wallet: newBonusWallet
    });
  } catch (error) {
    console.error('Redeem Points Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during points redemption', error: error.message });
  }
});

// Update User Profile
app.put('/api/users/:userId/profile', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { name, phone, address, city } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }
    if (phone !== undefined && String(phone).trim() && !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    const [userRows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUser = userRows[0];
    const newName = (name && name.trim()) || currentUser.name;
    const newPhone = (phone && phone.trim()) || currentUser.phone;
    const newAddress = address !== undefined ? address.trim() : '';
    const newCity = city !== undefined ? city.trim() : '';

    // Update users table
    await pool.query(
      'UPDATE users SET name = ?, phone = ? WHERE user_id = ?',
      [newName, newPhone, userId]
    );

    // Update customers table if customer
    if (currentUser.role !== 'SUPPLIER') {
      const [custRows] = await pool.query('SELECT * FROM customers WHERE customer_id = ?', [userId]);
      if (custRows.length > 0) {
        await pool.query(
          'UPDATE customers SET customer_name = ?, contact_number = ?, address = ?, city = ? WHERE customer_id = ?',
          [newName, newPhone, newAddress, newCity, userId]
        );
      } else {
        await pool.query(
          'INSERT INTO customers (customer_id, customer_name, contact_number, address, city) VALUES (?, ?, ?, ?, ?)',
          [userId, newName, newPhone, newAddress, newCity]
        );
      }
    } else {
      await pool.query(
        'UPDATE suppliers SET contact_number = ?, address = ?, city = ? WHERE supplier_id = ?',
        [newPhone, newAddress, newCity, userId]
      );
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        user_id: userId,
        name: newName,
        email: currentUser.email,
        phone: newPhone,
        address: newAddress,
        city: newCity
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

// Floral Reminders: Get Reminders for User
app.get('/api/reminders/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT reminder_id, user_id, occasion_title, occasion_date, bouquet_preset, created_at FROM floral_reminders WHERE user_id = ? ORDER BY reminder_id DESC',
      [userId]
    );
    return res.json({
      success: true,
      reminders: rows
    });
  } catch (error) {
    console.error('Get Reminders Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reminders', error: error.message });
  }
});

// Floral Reminders: Add/Save New Reminder
app.post('/api/reminders', async (req, res) => {
  const { user_id, occasion_title, occasion_date, bouquet_preset } = req.body;
  const userId = parseInt(user_id, 10);
  const title = (occasion_title || '').trim();
  const date = (occasion_date || '').trim();
  const preset = (bouquet_preset || '').trim();

  if (isNaN(userId) || !title) {
    return res.status(400).json({ success: false, message: 'User ID and occasion title are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO floral_reminders (user_id, occasion_title, occasion_date, bouquet_preset) VALUES (?, ?, ?, ?)',
      [userId, title, date, preset]
    );

    return res.json({
      success: true,
      message: 'Occasion reminder saved successfully!',
      reminder_id: result.insertId
    });
  } catch (error) {
    console.error('Save Reminder Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save reminder', error: error.message });
  }
});

// Change Password
app.post('/api/auth/change-password', async (req, res) => {
  const { user_id, current_password, new_password } = req.body;
  const userId = parseInt(user_id, 10);
  const currentPass = (current_password || '').trim();
  const newPass = (new_password || '').trim();

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Valid User ID is required' });
  }
  if (!currentPass) {
    return res.status(400).json({ success: false, message: 'Current password is required' });
  }
  if (!newPass || newPass.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_id, password_hash FROM users WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];

    // Verify current password
    if (user.password_hash) {
      const isMatch = bcrypt.compareSync(currentPass, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect. Please check and try again.'
        });
      }
    }

    const newHash = bcrypt.hashSync(newPass, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, userId]);

    return res.json({
      success: true,
      message: 'Password changed successfully! You can sign in with your new password.'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
  }
});

// Shared per-supplier SQL scoping helpers
const buildSupplierFlowerPredicate = (flowerAlias, supplierId) => ({
  clause: `(${flowerAlias}.supplier_id = ? OR EXISTS (SELECT 1 FROM supplier_flowers sf_own WHERE sf_own.flower_id = ${flowerAlias}.flower_id AND (sf_own.supplier_user_id = ? OR sf_own.supplier_id = ?)))`,
  params: [supplierId, supplierId, supplierId]
});

const buildSupplierOrderPredicate = (orderAlias, supplierId) => {
  const fl = buildSupplierFlowerPredicate('f_own', supplierId);
  return {
    clause: `(${orderAlias}.supplier_id = ? OR (${orderAlias}.supplier_id IS NULL AND EXISTS (SELECT 1 FROM order_items oi_own JOIN flowers f_own ON oi_own.flower_id = f_own.flower_id WHERE oi_own.order_id = ${orderAlias}.order_id AND ${fl.clause})))`,
    params: [supplierId, ...fl.params]
  };
};

// Helper: Build live combined supplier notifications feed from MySQL scoped per supplier
const getSupplierNotificationsFeed = async (rawSupplierId) => {
  const sid = await resolveSupplierIdFlexible(rawSupplierId);
  if (!sid || sid <= 0) return [];
  const notifications = [];
  const ordFilter = buildSupplierOrderPredicate('o', sid);
  const flFilter = buildSupplierFlowerPredicate('f', sid);

  // 1. New Order Requests: real PENDING orders belonging to this supplier
  const [pendingOrders] = await pool.query(`
    SELECT
      o.order_id,
      CASE WHEN o.order_code LIKE '#%' THEN o.order_code ELSE CONCAT('#', COALESCE(o.order_code, CONCAT('PB-', o.order_id))) END AS order_number,
      o.order_date,
      o.status,
      COALESCE(NULLIF(TRIM(c.customer_name), ''), NULLIF(TRIM(u.name), ''), NULLIF(TRIM(inv.customer_name), ''), 'Customer') AS customer_name,
      COALESCE(
        NULLIF(TRIM(
          CASE
            WHEN NULLIF(TRIM(o.delivery_address), '') IS NOT NULL AND NULLIF(TRIM(o.delivery_city), '') IS NOT NULL
              AND LOWER(o.delivery_address) NOT LIKE CONCAT('%', LOWER(TRIM(o.delivery_city)), '%')
            THEN CONCAT(TRIM(o.delivery_address), ', ', TRIM(o.delivery_city))
            ELSE COALESCE(NULLIF(TRIM(o.delivery_address), ''), NULLIF(TRIM(d.destination_address), ''), NULLIF(TRIM(c.address), ''), NULLIF(TRIM(o.delivery_city), ''), NULLIF(TRIM(c.city), ''), '')
          END
        ), ''),
        ''
      ) AS delivery_address,
      COALESCE(d.delivery_date, o.order_date) AS delivery_date,
      COALESCE(SUM(oi.quantity), 0) AS total_quantity,
      COALESCE(MAX(inv.total_amount), SUM(oi.quantity * oi.price), 0) AS total_amount,
      COALESCE(GROUP_CONCAT(CONCAT(oi.quantity, 'x ', f.name) ORDER BY oi.order_item_id ASC SEPARATOR ', '), '') AS items_summary
    FROM orders o
    LEFT JOIN users u ON o.customer_id = u.user_id
    LEFT JOIN customers c ON o.customer_id = c.customer_id
    LEFT JOIN (
      SELECT order_id, MAX(total_amount) AS total_amount, MAX(customer_name) AS customer_name
      FROM invoices
      GROUP BY order_id
    ) inv ON o.order_id = inv.order_id
    LEFT JOIN (
      SELECT order_id, MAX(destination_address) AS destination_address, MAX(delivery_date) AS delivery_date
      FROM deliveries
      GROUP BY order_id
    ) d ON o.order_id = d.order_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN flowers f ON oi.flower_id = f.flower_id
    WHERE UPPER(COALESCE(o.status, '')) = 'PENDING'
      AND ${ordFilter.clause}
    GROUP BY o.order_id
    ORDER BY o.order_id DESC
  `, ordFilter.params);

  for (const po of pendingOrders) {
    const qty = Number(po.total_quantity || 0);
    const amt = parseFloat(po.total_amount || 0);
    const amtFormatted = 'Rs. ' + Math.round(amt).toLocaleString('en-US');
    const summaryText = po.items_summary || (qty > 0 ? `${qty} stems` : 'Order items');
    const addrPart = po.delivery_address ? ` • ${po.delivery_address}` : '';
    notifications.push({
      id: `order-${po.order_id}`,
      type: 'ORDER_REQUEST',
      badge: 'New',
      title: `New request ${po.order_number}`,
      subtitle: `${summaryText} • ${amtFormatted}${addrPart}`,
      action_hint: 'Tap to review & accept request →',
      order_id: po.order_id,
      order_number: po.order_number,
      items_summary: summaryText,
      total_quantity: qty,
      total_amount: amt,
      amount_formatted: amtFormatted,
      customer_name: po.customer_name,
      delivery_address: po.delivery_address,
      delivery_date: po.delivery_date,
      status: po.status || 'PENDING',
      created_at: po.order_date
    });
  }

  // 2. Low-Stock / Demand Alerts: scoped to flowers owned/declared by this supplier
  const [lowStockRows] = await pool.query(`
    SELECT
      f.flower_id,
      f.name AS flower_name,
      COALESCE(f.stock_quantity, i.stock_quantity, 0) AS stock_quantity,
      COALESCE(i.reorder_level, 30) AS reorder_level
    FROM flowers f
    LEFT JOIN inventory i ON f.flower_id = i.flower_id
    WHERE ${flFilter.clause}
      AND (COALESCE(f.stock_quantity, i.stock_quantity, 0) < 50
        OR COALESCE(f.stock_quantity, i.stock_quantity, 0) <= COALESCE(i.reorder_level, 30))
    ORDER BY COALESCE(f.stock_quantity, i.stock_quantity, 0) ASC
  `, flFilter.params);

  for (const ls of lowStockRows) {
    notifications.push({
      id: `stock-${ls.flower_id}`,
      type: 'LOW_STOCK',
      badge: 'Low Stock',
      title: `Low stock alert · ${ls.flower_name}`,
      subtitle: `Stock: ${ls.stock_quantity} left · Reorder level: ${ls.reorder_level} stems`,
      action_hint: 'Tap to restock inventory →',
      flower_id: ls.flower_id,
      flower_name: ls.flower_name,
      stock_quantity: Number(ls.stock_quantity),
      reorder_level: Number(ls.reorder_level),
      created_at: new Date().toISOString()
    });
  }

  // 3. Payment Received Alerts: real DELIVERED orders + completed supplier_payments scoped to this supplier
  const [paymentRows] = await pool.query(`
    SELECT * FROM (
      SELECT
        o.order_id AS ref_id,
        CASE WHEN o.order_code LIKE '#%' THEN o.order_code ELSE CONCAT('#', COALESCE(o.order_code, CONCAT('PB-', o.order_id))) END AS order_number,
        COALESCE(inv.total_amount, oi_totals.items_total, 0) AS amount,
        CASE UPPER(COALESCE(pay.payment_method, 'BANK_TRANSFER'))
          WHEN 'CARD' THEN 'Card Payment'
          WHEN 'CASH' THEN 'Cash Settlement'
          ELSE 'Bank Transfer'
        END AS payment_method,
        COALESCE(pay.payment_date, inv.issue_date, o.order_date) AS payment_date
      FROM orders o
      LEFT JOIN (
        SELECT order_id, MAX(invoice_id) AS invoice_id, MAX(total_amount) AS total_amount, MAX(issue_date) AS issue_date
        FROM invoices
        GROUP BY order_id
      ) inv ON o.order_id = inv.order_id
      LEFT JOIN (
        SELECT invoice_id, MAX(payment_method) AS payment_method, MAX(payment_date) AS payment_date
        FROM payments
        GROUP BY invoice_id
      ) pay ON inv.invoice_id = pay.invoice_id
      LEFT JOIN (
        SELECT order_id, SUM(quantity * price) AS items_total
        FROM order_items
        GROUP BY order_id
      ) oi_totals ON o.order_id = oi_totals.order_id
      WHERE (UPPER(COALESCE(o.status, '')) = 'DELIVERED'
         OR UPPER(COALESCE(o.fulfilment_status, '')) = 'DELIVERED')
        AND ${ordFilter.clause}

      UNION ALL

      SELECT
        (100000 + sp.supplier_payment_id) AS ref_id,
        CONCAT('#PB-BATCH-', sp.place_order_id) AS order_number,
        sp.amount,
        CASE UPPER(COALESCE(sp.payment_method, 'BANK_TRANSFER'))
          WHEN 'CASH' THEN 'Cash Settlement'
          ELSE 'Bank Transfer'
        END AS payment_method,
        sp.payment_date
      FROM supplier_payments sp
      WHERE UPPER(COALESCE(sp.status, '')) = 'COMPLETED'
        AND sp.supplier_id = ?
    ) payouts
    ORDER BY payment_date DESC, ref_id DESC
  `, [...ordFilter.params, sid]);

  for (const p of paymentRows) {
    const amt = parseFloat(p.amount || 0);
    const amtFormatted = 'Rs. ' + Math.round(amt).toLocaleString('en-US');
    const dateOnly = p.payment_date ? new Date(p.payment_date).toISOString().slice(0, 10) : '';
    notifications.push({
      id: `payment-${p.ref_id}`,
      type: 'PAYMENT',
      badge: 'Paid',
      title: 'Payment received',
      subtitle: `Order ${p.order_number} · ${amtFormatted}`,
      action_hint: `${p.payment_method}${dateOnly ? ' • ' + dateOnly : ''} • View payouts →`,
      order_number: p.order_number,
      total_amount: amt,
      amount_formatted: amtFormatted,
      payment_method: p.payment_method,
      payment_date: p.payment_date,
      created_at: p.payment_date
    });
  }

  return notifications;
};

// Dedicated Supplier Notifications endpoint
app.get(['/api/suppliers/:supplierId/notifications', '/api/supplier/notifications/:supplierId', '/api/notifications'], async (req, res) => {
  try {
    const supplierId = req.params.supplierId || req.query.supplierId || req.query.userId || 0;
    const notifications = await getSupplierNotificationsFeed(supplierId);
    return res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Supplier Notifications Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch supplier notifications', error: error.message });
  }
});

// Get User Notifications (returns live supplier feed for SUPPLIER users, customer notifications otherwise)
app.get('/api/notifications/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    if (!isNaN(userId) && userId > 0) {
      const [uRows] = await pool.query('SELECT role FROM users WHERE user_id = ? LIMIT 1', [userId]);
      if (uRows.length > 0 && String(uRows[0].role || '').toUpperCase() === 'SUPPLIER') {
        const supplierNotifs = await getSupplierNotificationsFeed(userId);
        return res.json({
          success: true,
          count: supplierNotifs.length,
          notifications: supplierNotifs
        });
      }
    }

    const [rows] = await pool.query(
      'SELECT notification_id, order_id, user_id, title, message, status, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [isNaN(userId) ? 0 : userId]
    );

    let notifications = rows;
    if (notifications.length === 0 && !isNaN(userId) && userId > 0) {
      // Derive notifications strictly from real MySQL orders if no rows exist in notifications table
      const [ordRows] = await pool.query(
        `SELECT order_id, order_code, status, COALESCE(fulfilment_status, status) AS fulfilment_status, order_date
         FROM orders
         WHERE customer_id = ?
         ORDER BY order_id DESC
         LIMIT 15`,
        [userId]
      );
      notifications = ordRows.map((o) => ({
        notification_id: o.order_id,
        order_id: o.order_id,
        user_id: userId,
        title: `Order ${o.fulfilment_status || o.status || 'Update'}`,
        message: `Your floral order ${o.order_code || ('#PB-' + o.order_id)} is currently ${o.fulfilment_status || o.status}.`,
        status: 'UNREAD',
        created_at: o.order_date
      }));
    }

    return res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Notifications Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
});

/* ==========================================================
   2. FLOWERS CATALOG & INVENTORY
   ========================================================== */

// Get all flowers with live stock, sales & ratings (optionally scoped by supplier_id)
app.get('/api/flowers', async (req, res) => {
  try {
    const rawSup = req.query.supplier_id || req.query.user_id || req.query.supplierId;
    let whereSql = '';
    let queryParams = [];
    if (rawSup !== undefined && String(rawSup).trim() !== '') {
      const sid = await resolveSupplierIdFlexible(rawSup);
      if (!sid || sid <= 0) {
        return res.json({ success: true, count: 0, flowers: [] });
      }
      const flFilter = buildSupplierFlowerPredicate('f', sid);
      whereSql = `WHERE ${flFilter.clause}`;
      queryParams = flFilter.params;
    }

    const query = `
      SELECT 
        f.flower_id,
        f.name,
        f.category,
        f.color,
        f.unit_price,
        f.image_url,
        f.description,
        f.created_at,
        f.supplier_id,
        COALESCE(f.stock_quantity, MAX(i.stock_quantity), 0) AS stock_quantity,
        COALESCE(MAX(i.reorder_level), 30) AS reorder_level,
        COALESCE(sales.sold_count, 0) AS sold_count,
        COALESCE(reviews.avg_rating, 5.0) AS avg_rating,
        COALESCE(reviews.review_count, 0) AS review_count
      FROM flowers f
      LEFT JOIN inventory i ON f.flower_id = i.flower_id
      LEFT JOIN (
        SELECT flower_id, COALESCE(SUM(quantity), 0) AS sold_count
        FROM order_items
        GROUP BY flower_id
      ) sales ON f.flower_id = sales.flower_id
      LEFT JOIN (
        SELECT flower_id, COALESCE(ROUND(AVG(rating), 1), 5.0) AS avg_rating, COUNT(review_id) AS review_count
        FROM rating_reviews
        GROUP BY flower_id
      ) reviews ON f.flower_id = reviews.flower_id
      ${whereSql}
      GROUP BY f.flower_id
      ORDER BY f.flower_id ASC
    `;
    const [flowers] = await pool.query(query, queryParams);
    return res.json({ success: true, count: flowers.length, flowers });
  } catch (error) {
    console.error('Get Flowers Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch flowers', error: error.message });
  }
});

// Get single flower detail + latest customer reviews
app.get('/api/flowers/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        f.*,
        COALESCE(f.stock_quantity, MAX(i.stock_quantity), 0) AS stock_quantity,
        COALESCE(MAX(i.reorder_level), 30) AS reorder_level,
        COALESCE(sales.sold_count, 0) AS sold_count,
        COALESCE(reviews.avg_rating, 0.0) AS avg_rating,
        COALESCE(reviews.review_count, 0) AS review_count
      FROM flowers f
      LEFT JOIN inventory i ON f.flower_id = i.flower_id
      LEFT JOIN (
        SELECT flower_id, COALESCE(SUM(quantity), 0) AS sold_count
        FROM order_items
        GROUP BY flower_id
      ) sales ON f.flower_id = sales.flower_id
      LEFT JOIN (
        SELECT flower_id, COALESCE(ROUND(AVG(rating), 1), 0.0) AS avg_rating, COUNT(review_id) AS review_count
        FROM rating_reviews
        GROUP BY flower_id
      ) reviews ON f.flower_id = reviews.flower_id
      WHERE f.flower_id = ?
      GROUP BY f.flower_id
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Flower not found' });
    }

    const [reviewRows] = await pool.query(`
      SELECT
        rr.review_id,
        rr.order_id,
        rr.customer_id,
        rr.flower_id,
        rr.rating,
        rr.comment,
        rr.review_date AS created_at,
        COALESCE(NULLIF(TRIM(u.name), ''), NULLIF(TRIM(c.customer_name), ''), 'Verified Buyer') AS reviewer_name
      FROM rating_reviews rr
      LEFT JOIN users u ON rr.customer_id = u.user_id
      LEFT JOIN customers c ON rr.customer_id = c.customer_id
      WHERE rr.flower_id = ?
      ORDER BY rr.review_date DESC, rr.review_id DESC
      LIMIT 10
    `, [req.params.id]);

    return res.json({
      success: true,
      flower: {
        ...rows[0],
        reviews: reviewRows
      },
      reviews: reviewRows
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
   3. ORDERS & CHECKOUT
   ========================================================== */

// Place a new customer order (atomic MySQL transaction with stock locking & server pricing)
app.post('/api/orders', async (req, res) => {
  const { customer_id, delivery_address, delivery_city, payment_method, items, order_code } = req.body;
  const custId = parseInt(customer_id, 10);
  if (isNaN(custId) || custId <= 0) {
    return res.status(400).json({ success: false, message: 'Valid customer_id is required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must include at least one flower item' });
  }

  // Consolidate & validate item quantities up-front
  const qtyByFlowerId = new Map();
  for (const item of items) {
    const fId = parseInt(item && item.flower_id, 10);
    const qty = parseInt(item && item.quantity, 10);
    if (isNaN(fId) || fId <= 0 || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Each item must have a valid flower_id and quantity >= 1' });
    }
    qtyByFlowerId.set(fId, (qtyByFlowerId.get(fId) || 0) + qty);
  }
  if (qtyByFlowerId.size === 0) {
    return res.status(400).json({ success: false, message: 'Order must include at least one valid flower item' });
  }

  const payMethod = (payment_method && String(payment_method).trim()) ? String(payment_method).trim().toUpperCase() : 'CARD';
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Look up customer profile from MySQL for delivery defaults & invoice customer_name
    const [custRows] = await conn.query(
      `SELECT u.user_id,
              COALESCE(NULLIF(TRIM(c.customer_name), ''), u.name, '') AS customer_name,
              COALESCE(NULLIF(TRIM(c.address), ''), '') AS address,
              COALESCE(NULLIF(TRIM(c.city), ''), '') AS city
       FROM users u
       LEFT JOIN customers c ON u.user_id = c.customer_id
       WHERE u.user_id = ?
       LIMIT 1`,
      [custId]
    );
    if (custRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Customer account not found' });
    }

    const customerRec = custRows[0];
    const address = (delivery_address && String(delivery_address).trim()) || customerRec.address || '';
    const city = (delivery_city && String(delivery_city).trim()) || customerRec.city || '';
    const customerName = customerRec.customer_name || null;

    // Verify & lock flower rows + check stock before creating order
    const verifiedItems = [];
    let subtotal = 0;
    let resolvedOrderSupplierId = null;
    for (const [fId, qty] of qtyByFlowerId.entries()) {
      const [flRows] = await conn.query(
        'SELECT flower_id, name, unit_price, stock_quantity, supplier_id FROM flowers WHERE flower_id = ? LIMIT 1 FOR UPDATE',
        [fId]
      );
      if (flRows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: `Flower #${fId} was not found` });
      }
      const fl = flRows[0];
      if (!resolvedOrderSupplierId) {
        if (fl.supplier_id && Number(fl.supplier_id) > 0) {
          resolvedOrderSupplierId = Number(fl.supplier_id);
        } else {
          const [sfOwner] = await conn.query(
            'SELECT COALESCE(supplier_user_id, supplier_id) AS sid FROM supplier_flowers WHERE flower_id = ? ORDER BY supplier_flower_id ASC LIMIT 1',
            [fId]
          );
          resolvedOrderSupplierId = (sfOwner.length > 0 && sfOwner[0].sid) ? Number(sfOwner[0].sid) : 3;
        }
      }
      let rawStock = fl.stock_quantity;
      if (rawStock === null || rawStock === undefined) {
        const [invRows] = await conn.query('SELECT MAX(stock_quantity) AS stock_quantity FROM inventory WHERE flower_id = ?', [fId]);
        rawStock = invRows.length > 0 ? invRows[0].stock_quantity : 0;
      }
      const available = Math.max(0, parseInt(rawStock, 10) || 0);
      if (qty > available) {
        await conn.rollback();
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${fl.name} (${available} stems available, requested ${qty}).`
        });
      }
      const itemPrice = parseFloat(fl.unit_price) || 0;
      subtotal += (itemPrice * qty);
      verifiedItems.push({ flower_id: fId, qty, itemPrice });
    }

    const orderCode = (order_code && String(order_code).trim()) || `PB-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Create order scoped to owning supplier
    const [orderRes] = await conn.query(
      `INSERT INTO orders (order_code, customer_id, supplier_id, delivery_address, delivery_city, payment_status, status, fulfilment_status)
       VALUES (?, ?, ?, ?, ?, 'PAID', 'PENDING', 'Pending')`,
      [orderCode, custId, resolvedOrderSupplierId || 3, address, city]
    );
    const orderId = orderRes.insertId;

    // 2. Insert verified order items & decrement flowers + inventory atomically
    for (const vi of verifiedItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, flower_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, vi.flower_id, vi.qty, vi.itemPrice]
      );
      await conn.query(
        'UPDATE inventory SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - ?) WHERE flower_id = ?',
        [vi.qty, vi.flower_id]
      );
      await conn.query(
        'UPDATE flowers SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - ?) WHERE flower_id = ?',
        [vi.qty, vi.flower_id]
      );
    }

    const deliveryFee = 200.00;
    const totalAmount = subtotal + deliveryFee;

    // 3. Create invoice
    const invoiceNum = `INV-${orderId}-${Date.now().toString().slice(-4)}`;
    const [invRes] = await conn.query(
      `INSERT INTO invoices (invoice_number, order_id, customer_name, total_amount, status)
       VALUES (?, ?, ?, ?, 'PAID')`,
      [invoiceNum, orderId, customerName, totalAmount]
    );

    // 4. Record payment
    await conn.query(
      `INSERT INTO payments (invoice_id, amount_paid, payment_method, status)
       VALUES (?, ?, ?, 'SUCCESS')`,
      [invRes.insertId, totalAmount, payMethod]
    );

    // 5. Schedule Delivery
    const deliveryCode = `DEL-${orderId}-${Math.floor(100 + Math.random() * 900)}`;
    await conn.query(
      `INSERT INTO deliveries (delivery_code, order_id, vehicle_number, driver_name, driver_phone, destination_address, delivery_date, status)
       VALUES (?, ?, NULL, NULL, NULL, ?, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'SCHEDULED')`,
      [deliveryCode, orderId, address]
    );

    await conn.commit();
    return res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order_id: orderId,
      order_code: orderCode,
      total_amount: totalAmount,
      delivery_address: address,
      status: 'PENDING'
    });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    console.error('Place Order Error:', error);
    return res.status(500).json({ success: false, message: 'Order placement failed', error: error.message });
  } finally {
    conn.release();
  }
});

// Get orders for a specific customer
app.get(['/api/orders/customer/:customerId', '/api/customers/:customerId/orders'], async (req, res) => {
  try {
    const custId = parseInt(req.params.customerId, 10);
    if (isNaN(custId) || custId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid customer_id is required', count: 0, orders: [] });
    }
    const query = `
      SELECT 
        o.order_id,
        o.order_code,
        o.order_date,
        o.delivery_address,
        o.delivery_city,
        o.payment_status,
        COALESCE(o.fulfilment_status, o.status) AS fulfilment_status,
        o.status,
        COALESCE(i.total_amount, 0) AS total_amount,
        GROUP_CONCAT(CONCAT(oi.quantity, 'x ', f.name) SEPARATOR ', ') AS items_summary,
        d.delivery_code,
        COALESCE(d.status, 'IN_TRANSIT') AS delivery_status,
        d.delivery_date,
        d.vehicle_number,
        d.driver_name,
        d.driver_phone
      FROM orders o
      LEFT JOIN invoices i ON o.order_id = i.order_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN flowers f ON oi.flower_id = f.flower_id
      LEFT JOIN deliveries d ON o.order_id = d.order_id
      WHERE o.customer_id = ?
      GROUP BY o.order_id, d.delivery_id
      ORDER BY o.order_date DESC, o.order_id DESC
    `;
    const [orders] = await pool.query(query, [custId]);

    const active_orders = [];
    const history_orders = [];

    for (const o of orders) {
      const st = (o.status || '').toUpperCase();
      const fst = (o.fulfilment_status || '').toUpperCase();
      const dst = (o.delivery_status || '').toUpperCase();
      if (st === 'DELIVERED' || fst === 'DELIVERED' || dst === 'DELIVERED' || st === 'CANCELLED' || fst === 'CANCELLED') {
        history_orders.push(o);
      } else {
        active_orders.push(o);
      }
    }

    return res.json({
      success: true,
      count: orders.length,
      orders,
      active_orders,
      history_orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get detailed breakdown of a single order
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const rawParam = String(req.params.orderId || '').trim();
    const cleanCode = rawParam.replace(/^#/, '');
    const numericId = parseInt(cleanCode, 10);

    const [orderRows] = await pool.query(
      `SELECT o.*,
              COALESCE(NULLIF(TRIM(c.customer_name), ''), NULLIF(TRIM(u.name), ''), NULLIF(TRIM(inv.customer_name), ''), 'Customer') AS customer_name,
              COALESCE(NULLIF(TRIM(c.contact_number), ''), NULLIF(TRIM(u.phone), ''), '') AS customer_phone,
              COALESCE(
                NULLIF(TRIM(
                  CASE
                    WHEN NULLIF(TRIM(o.delivery_address), '') IS NOT NULL AND NULLIF(TRIM(o.delivery_city), '') IS NOT NULL
                      AND LOWER(o.delivery_address) NOT LIKE CONCAT('%', LOWER(TRIM(o.delivery_city)), '%')
                    THEN CONCAT(TRIM(o.delivery_address), ', ', TRIM(o.delivery_city))
                    ELSE COALESCE(NULLIF(TRIM(o.delivery_address), ''), NULLIF(TRIM(c.address), ''), NULLIF(TRIM(o.delivery_city), ''), NULLIF(TRIM(c.city), ''), '')
                  END
                ), ''),
                ''
              ) AS resolved_delivery_address
       FROM orders o
       LEFT JOIN users u ON o.customer_id = u.user_id
       LEFT JOIN customers c ON o.customer_id = c.customer_id
       LEFT JOIN (
         SELECT order_id, MAX(customer_name) AS customer_name
         FROM invoices
         GROUP BY order_id
       ) inv ON o.order_id = inv.order_id
       WHERE o.order_id = ? OR o.order_code = ? OR o.order_code = ?
       LIMIT 1`,
      [isNaN(numericId) ? -1 : numericId, rawParam, cleanCode]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orderRows[0];
    if ((!order.delivery_address || !order.delivery_address.trim()) && order.resolved_delivery_address) {
      order.delivery_address = order.resolved_delivery_address;
    } else if (order.resolved_delivery_address) {
      order.delivery_address = order.resolved_delivery_address;
    }

    const [items] = await pool.query(`
      SELECT oi.*, f.name, f.category, f.image_url 
      FROM order_items oi
      JOIN flowers f ON oi.flower_id = f.flower_id
      WHERE oi.order_id = ?
      ORDER BY oi.order_item_id ASC
    `, [order.order_id]);

    const [invoice] = await pool.query('SELECT * FROM invoices WHERE order_id = ?', [order.order_id]);
    const [payment] = await pool.query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_id DESC LIMIT 1', [invoice[0] ? invoice[0].invoice_id : 0]);
    const [deliveries] = await pool.query('SELECT * FROM deliveries WHERE order_id = ? ORDER BY delivery_id DESC LIMIT 1', [order.order_id]);

    // Resolve supplier estate dynamically from MySQL suppliers/supplier_flowers
    let supplierInfo = null;
    try {
      const flowerIds = items.map(it => it.flower_id).filter(Boolean);
      if (flowerIds.length > 0) {
        const [sfRows] = await pool.query(
          `SELECT s.supplier_id, s.supplier_code, s.supplier_name, s.city, s.address, s.contact_number
           FROM supplier_flowers sf
           JOIN suppliers s ON COALESCE(sf.supplier_user_id, sf.supplier_id) = s.supplier_id
           WHERE sf.flower_id IN (?)
           LIMIT 1`,
          [flowerIds]
        );
        if (sfRows.length > 0) supplierInfo = sfRows[0];
      }
      if (!supplierInfo) {
        const [supRows] = await pool.query(
          'SELECT supplier_id, supplier_code, supplier_name, city, address, contact_number FROM suppliers WHERE is_approved = 1 ORDER BY supplier_id ASC LIMIT 1'
        );
        if (supRows.length > 0) supplierInfo = supRows[0];
      }
    } catch (_) {}

    const itemsSubtotal = items.reduce((sum, it) => sum + ((parseFloat(it.price) || 0) * (parseInt(it.quantity, 10) || 0)), 0);
    const invoiceTotal = invoice[0] ? (parseFloat(invoice[0].total_amount) || 0) : itemsSubtotal;
    const deliveryFee = invoiceTotal > itemsSubtotal ? (invoiceTotal - itemsSubtotal) : 0;

    return res.json({
      success: true,
      order: {
        ...order,
        items,
        subtotal: itemsSubtotal,
        delivery_fee: deliveryFee,
        invoice: invoice[0] || null,
        payment: payment[0] || null,
        delivery: deliveries[0] || null,
        supplier: supplierInfo
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
   4. SUPPLIER PORTAL (Harvests, Stock, Demand)
   ========================================================= */

// Get supplier inventory & stock (optionally scoped by supplier_id)
app.get('/api/supplier/stock', async (req, res) => {
  try {
    const rawSup = req.query.supplier_id || req.query.user_id || req.query.supplierId;
    let whereSql = '';
    let queryParams = [];
    if (rawSup !== undefined && String(rawSup).trim() !== '') {
      const sid = await resolveSupplierIdFlexible(rawSup);
      if (!sid || sid <= 0) {
        return res.json({ success: true, stock: [], flowers: [] });
      }
      const flFilter = buildSupplierFlowerPredicate('f', sid);
      whereSql = `WHERE ${flFilter.clause}`;
      queryParams = flFilter.params;
    }

    const [rows] = await pool.query(`
      SELECT f.flower_id, f.name, f.category, f.unit_price, f.supplier_id,
             COALESCE(f.stock_quantity, i.stock_quantity, 0) AS stock_quantity,
             COALESCE(i.reorder_level, 30) AS reorder_level,
             i.last_restocked
      FROM flowers f
      LEFT JOIN inventory i ON f.flower_id = i.flower_id
      ${whereSql}
      ORDER BY f.name ASC
    `, queryParams);
    return res.json({ success: true, stock: rows, flowers: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update supplier stock
app.post('/api/supplier/stock-update', async (req, res) => {
  const { flower_id, stock_quantity } = req.body;
  const flowerId = parseInt(flower_id, 10);
  const rawQty = Number(stock_quantity);
  if (isNaN(flowerId) || flowerId <= 0) {
    return res.status(400).json({ success: false, message: 'Valid flower_id is required' });
  }
  if (!Number.isFinite(rawQty) || !Number.isInteger(rawQty) || rawQty < 0) {
    return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative' });
  }
  const stockQty = rawQty;
  try {
    const [flRes] = await pool.query('UPDATE flowers SET stock_quantity = ? WHERE flower_id = ?', [stockQty, flowerId]);
    if (flRes.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Flower not found' });
    }
    const [invCheck] = await pool.query('SELECT inventory_id FROM inventory WHERE flower_id = ?', [flowerId]);
    if (invCheck.length > 0) {
      await pool.query(
        'UPDATE inventory SET stock_quantity = ?, last_restocked = CURRENT_TIMESTAMP WHERE flower_id = ?',
        [stockQty, flowerId]
      );
    } else {
      await pool.query(
        'INSERT INTO inventory (flower_id, stock_quantity, reorder_level) VALUES (?, ?, 30)',
        [flowerId, stockQty]
      );
    }
    return res.json({ success: true, message: 'Stock updated successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Real Supplier Orders scoped by supplier_id (Query MySQL orders, order_items, flowers, invoices, deliveries, customers, and users)
app.get(['/api/suppliers/orders', '/api/supplier/orders'], async (req, res) => {
  try {
    const rawSup = req.query.supplier_id || req.query.user_id || req.query.supplierId;
    let whereSql = '';
    let queryParams = [];
    if (rawSup !== undefined && String(rawSup).trim() !== '') {
      const sid = await resolveSupplierIdFlexible(rawSup);
      if (!sid || sid <= 0) {
        return res.json({ success: true, count: 0, orders: [], requests: [] });
      }
      const ordFilter = buildSupplierOrderPredicate('o', sid);
      whereSql = `WHERE ${ordFilter.clause}`;
      queryParams = ordFilter.params;
    }

    const query = `
      SELECT 
        o.order_id,
        CASE
          WHEN o.order_code LIKE '#%' THEN o.order_code
          ELSE CONCAT('#', COALESCE(o.order_code, CONCAT('PB-', o.order_id)))
        END AS order_code,
        o.customer_id,
        COALESCE(NULLIF(TRIM(c.customer_name), ''), NULLIF(TRIM(u.name), ''), NULLIF(TRIM(inv.customer_name), ''), 'Customer') AS customer_name,
        COALESCE(NULLIF(TRIM(c.contact_number), ''), NULLIF(TRIM(u.phone), ''), '') AS customer_phone,
        COALESCE(
          NULLIF(TRIM(
            CASE
              WHEN NULLIF(TRIM(o.delivery_address), '') IS NOT NULL AND NULLIF(TRIM(o.delivery_city), '') IS NOT NULL
                AND LOWER(o.delivery_address) NOT LIKE CONCAT('%', LOWER(TRIM(o.delivery_city)), '%')
              THEN CONCAT(TRIM(o.delivery_address), ', ', TRIM(o.delivery_city))
              ELSE COALESCE(NULLIF(TRIM(o.delivery_address), ''), NULLIF(TRIM(d.destination_address), ''), NULLIF(TRIM(c.address), ''), NULLIF(TRIM(o.delivery_city), ''), NULLIF(TRIM(c.city), ''), '')
            END
          ), ''),
          ''
        ) AS delivery_address,
        COALESCE(o.delivery_city, c.city, '') AS delivery_city,
        o.status,
        CASE 
          WHEN UPPER(COALESCE(o.status, '')) = 'DELIVERED' THEN 'Delivered'
          WHEN UPPER(COALESCE(o.status, '')) = 'CANCELLED' THEN 'Cancelled'
          WHEN UPPER(COALESCE(o.status, '')) = 'PENDING' THEN 'Pending'
          WHEN UPPER(COALESCE(o.status, '')) = 'SHIPPED' THEN 'Dispatched'
          ELSE COALESCE(NULLIF(o.fulfilment_status, ''),
            CASE 
              WHEN UPPER(COALESCE(o.status, '')) = 'CONFIRMED' THEN 'Preparing'
              ELSE 'Preparing'
            END
          )
        END AS fulfilment_status,
        COALESCE(d.delivery_date, o.order_date) AS created_at,
        COALESCE(SUM(oi.quantity), 0) AS total_quantity,
        COALESCE(MAX(inv.total_amount), SUM(oi.quantity * oi.price), 0) AS total_amount,
        COALESCE(GROUP_CONCAT(CONCAT(oi.quantity, 'x ', f.name) ORDER BY oi.order_item_id ASC SEPARATOR ', '), '') AS flower_summary
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.user_id
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN (
        SELECT order_id, MAX(total_amount) AS total_amount, MAX(customer_name) AS customer_name
        FROM invoices
        GROUP BY order_id
      ) inv ON o.order_id = inv.order_id
      LEFT JOIN (
        SELECT order_id, MAX(destination_address) AS destination_address, MAX(delivery_date) AS delivery_date
        FROM deliveries
        GROUP BY order_id
      ) d ON o.order_id = d.order_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN flowers f ON oi.flower_id = f.flower_id
      ${whereSql}
      GROUP BY o.order_id
      ORDER BY o.order_id DESC
    `;
    const [rows] = await pool.query(query, queryParams);
    return res.json({ success: true, count: rows.length, orders: rows, requests: rows });
  } catch (error) {
    console.error('Get Supplier Orders Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update order status & fulfilment status in MySQL orders table (transactional with cancellation stock restore)
app.put(['/api/orders/:orderId/status', '/api/supplier/orders/:orderId/status'], async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const { status, fulfilment_status } = req.body;
  if (isNaN(orderId) || orderId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingRows] = await conn.query(
      'SELECT order_id, customer_id, order_code, status, fulfilment_status FROM orders WHERE order_id = ? LIMIT 1 FOR UPDATE',
      [orderId]
    );
    if (existingRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: `Order #${orderId} not found` });
    }

    const prevStatus = String(existingRows[0].status || '').toUpperCase();
    let resolvedStatus = 'CONFIRMED';
    let resolvedFulfilment = fulfilment_status || status || 'Preparing';

    const lower = (status || fulfilment_status || '').toLowerCase();
    if (lower.includes('deliver')) {
      resolvedStatus = 'DELIVERED';
      resolvedFulfilment = 'Delivered';
    } else if (lower.includes('dispatch') || lower.includes('ship')) {
      resolvedStatus = 'SHIPPED';
      resolvedFulfilment = 'Dispatched';
    } else if (lower.includes('ready')) {
      resolvedStatus = 'CONFIRMED';
      resolvedFulfilment = 'Ready';
    } else if (lower.includes('accept') || lower.includes('prepar') || lower.includes('confirm')) {
      resolvedStatus = 'CONFIRMED';
      resolvedFulfilment = 'Preparing';
    } else if (lower.includes('cancel') || lower.includes('reject')) {
      resolvedStatus = 'CANCELLED';
      resolvedFulfilment = 'Cancelled';
    }

    await conn.query(
      'UPDATE orders SET status = ?, fulfilment_status = ? WHERE order_id = ?',
      [resolvedStatus, resolvedFulfilment, orderId]
    );

    // Restore stock when an order transitions to CANCELLED for the first time
    if (prevStatus !== 'CANCELLED' && resolvedStatus === 'CANCELLED') {
      const [orderItems] = await conn.query('SELECT flower_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const oi of orderItems) {
        const qty = parseInt(oi.quantity, 10) || 0;
        if (qty > 0 && oi.flower_id) {
          await conn.query('UPDATE flowers SET stock_quantity = COALESCE(stock_quantity, 0) + ? WHERE flower_id = ?', [qty, oi.flower_id]);
          await conn.query('UPDATE inventory SET stock_quantity = COALESCE(stock_quantity, 0) + ? WHERE flower_id = ?', [qty, oi.flower_id]);
        }
      }
      try {
        await conn.query(`UPDATE deliveries SET status = 'CANCELLED' WHERE order_id = ?`, [orderId]);
      } catch (_) {}
    }

    // Sync deliveries & settlement tables
    const { vehicle_number, driver_name, driver_phone } = req.body;
    if (resolvedStatus === 'SHIPPED') {
      try {
        await conn.query(
          `UPDATE deliveries
           SET status = 'IN_TRANSIT',
               vehicle_number = COALESCE(?, vehicle_number),
               driver_name = COALESCE(?, driver_name),
               driver_phone = COALESCE(?, driver_phone)
           WHERE order_id = ?`,
          [vehicle_number || null, driver_name || null, driver_phone || null, orderId]
        );
      } catch (_) {}
    } else if (resolvedStatus === 'DELIVERED') {
      try {
        await conn.query(`UPDATE deliveries SET status = 'DELIVERED' WHERE order_id = ?`, [orderId]);
        await conn.query(`UPDATE orders SET payment_status = 'PAID' WHERE order_id = ?`, [orderId]);
        await conn.query(`UPDATE invoices SET status = 'PAID' WHERE order_id = ?`, [orderId]);
      } catch (_) {}
    }

    // Add customer notification
    try {
      const code = existingRows[0].order_code || `#PB-${orderId}`;
      const custId = existingRows[0].customer_id;
      await conn.query(
        'INSERT INTO notifications (user_id, order_id, title, message, status) VALUES (?, ?, ?, ?, "UNREAD")',
        [custId, orderId, `Order ${resolvedFulfilment}`, `Your floral order ${code} is now ${resolvedFulfilment}.`]
      );
    } catch (_) {}

    await conn.commit();
    return res.json({
      success: true,
      message: `Order #${orderId} status updated to ${resolvedFulfilment}`,
      status: resolvedStatus,
      fulfilment_status: resolvedFulfilment
    });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    console.error('Update Order Status Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    conn.release();
  }
});

// Bulk update flower stock quantities (rejects negative counts, runs atomically)
app.route('/api/flowers/bulk-stock').put(handleBulkStockUpdate).post(handleBulkStockUpdate);
async function handleBulkStockUpdate(req, res) {
  const updates = req.body && req.body.updates ? req.body.updates : req.body;
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ success: false, message: 'Expected a non-empty array of { flower_id, stock_quantity }' });
  }

  const parsedUpdates = [];
  for (const item of updates) {
    const flowerId = parseInt(item && item.flower_id, 10);
    const rawQty = Number(item && item.stock_quantity);
    if (isNaN(flowerId) || flowerId <= 0) {
      return res.status(400).json({ success: false, message: 'Every stock item must have a valid positive flower_id' });
    }
    if (!Number.isFinite(rawQty) || !Number.isInteger(rawQty) || rawQty < 0) {
      return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative' });
    }
    parsedUpdates.push({ flowerId, stockQty: rawQty });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let updatedCount = 0;
    for (const { flowerId, stockQty } of parsedUpdates) {
      const [flRes] = await conn.query('UPDATE flowers SET stock_quantity = ? WHERE flower_id = ?', [stockQty, flowerId]);
      if (flRes.affectedRows > 0) {
        const [invCheck] = await conn.query('SELECT inventory_id FROM inventory WHERE flower_id = ?', [flowerId]);
        if (invCheck.length > 0) {
          await conn.query('UPDATE inventory SET stock_quantity = ?, last_restocked = CURRENT_TIMESTAMP WHERE flower_id = ?', [stockQty, flowerId]);
        } else {
          await conn.query('INSERT INTO inventory (flower_id, stock_quantity, reorder_level) VALUES (?, ?, 30)', [flowerId, stockQty]);
        }
        updatedCount++;
      }
    }
    await conn.commit();
    return res.json({ success: true, message: `Successfully updated ${updatedCount} flower stock quantities`, updated_count: updatedCount });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    console.error('Bulk Stock Update Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    conn.release();
  }
}

// Resolve supplier_id from numeric supplier_id / user_id, email, or supplier_code
async function resolveSupplierIdFlexible(rawIdentifier) {
  if (rawIdentifier === undefined || rawIdentifier === null) return null;
  const raw = String(rawIdentifier).trim();
  if (!raw) return null;
  const numeric = parseInt(raw, 10);

  if (!isNaN(numeric) && String(numeric) === raw && numeric > 0) {
    const [sRows] = await pool.query('SELECT supplier_id FROM suppliers WHERE supplier_id = ? LIMIT 1', [numeric]);
    if (sRows.length > 0) return sRows[0].supplier_id;
    const [uRows] = await pool.query('SELECT user_id FROM users WHERE user_id = ? AND UPPER(role) = "SUPPLIER" LIMIT 1', [numeric]);
    if (uRows.length > 0) return uRows[0].user_id;
    return numeric;
  }

  const [byCodeOrEmail] = await pool.query(
    `SELECT COALESCE(s.supplier_id, u.user_id) AS sid
     FROM users u
     LEFT JOIN suppliers s ON s.supplier_id = u.user_id
     WHERE LOWER(COALESCE(u.email, '')) = LOWER(?)
        OR LOWER(COALESCE(s.supplier_code, '')) = LOWER(?)
     LIMIT 1`,
    [raw, raw]
  );
  if (byCodeOrEmail.length > 0 && byCodeOrEmail[0].sid) {
    return byCodeOrEmail[0].sid;
  }
  return null;
}

// Declared flowers endpoints (GET, POST, PUT, DELETE)
app.get([
  '/api/suppliers/declared-flowers',
  '/api/suppliers/:userId/declared-flowers',
  '/api/supplier/declared-flowers/:userId'
], async (req, res) => {
  const identifier = req.params.userId || req.query.supplier_id || req.query.user_id || req.query.email || req.query.supplier_code;
  const userId = await resolveSupplierIdFlexible(identifier);
  if (!userId || userId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid supplier ID' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT 
         sf.supplier_flower_id AS id,
         COALESCE(sf.supplier_user_id, sf.supplier_id) AS supplier_user_id,
         sf.flower_id,
         COALESCE(NULLIF(sf.flower_name, ''), f.name) AS flower_name,
         COALESCE(sf.supply_capacity, 0) AS supply_capacity,
         sf.updated_at,
         COALESCE(f.category, 'Highland Stems') AS category,
         COALESCE(f.unit_price, sf.supply_price, 0) AS unit_price
       FROM supplier_flowers sf
       LEFT JOIN flowers f ON sf.flower_id = f.flower_id
       WHERE sf.supplier_user_id = ? OR sf.supplier_id = ?
       ORDER BY sf.supplier_flower_id DESC`,
      [userId, userId]
    );

    return res.json({ success: true, supplier_id: userId, count: rows.length, flowers: rows });
  } catch (error) {
    console.error('Get Declared Flowers Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post([
  '/api/suppliers/declared-flowers',
  '/api/suppliers/:userId/declared-flowers',
  '/api/supplier/declared-flowers/:userId'
], async (req, res) => {
  const { supplier_id, user_id, email, flower_id, flower_name, supply_capacity, capacity: rawCapAlt, supply_price } = req.body;
  const identifier = req.params.userId || supplier_id || user_id || email || req.query.supplier_id || req.query.email;
  const userId = await resolveSupplierIdFlexible(identifier);
  if (!userId || userId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid supplier ID' });
  }

  const parsedCapacity = parseInt(supply_capacity !== undefined ? supply_capacity : rawCapAlt, 10);
  if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
    return res.status(400).json({ success: false, message: 'Supply capacity must be a positive number' });
  }

  let resolvedFlowerId = flower_id ? parseInt(flower_id, 10) : null;
  let resolvedName = (flower_name || '').trim();
  if (!resolvedFlowerId && !resolvedName) {
    return res.status(400).json({ success: false, message: 'Flower variety name or ID is required' });
  }

  try {
    let isNewFlower = false;
    const parsedPrice = parseFloat(supply_price);
    const fallbackPrice = (!isNaN(parsedPrice) && parsedPrice > 0) ? parsedPrice : 280.00;

    if (!resolvedFlowerId && resolvedName) {
      const [fRows] = await pool.query(
        'SELECT flower_id, name FROM flowers WHERE LOWER(TRIM(name)) = LOWER(?) LIMIT 1',
        [resolvedName]
      );
      if (fRows.length > 0) {
        resolvedFlowerId = fRows[0].flower_id;
        resolvedName = fRows[0].name;
      } else {
        isNewFlower = true;
        const [insF] = await pool.query(
          'INSERT INTO flowers (name, category, unit_price, color, description, stock_quantity, supplier_id) VALUES (?, ?, ?, "Multi", ?, ?, ?)',
          [resolvedName, resolvedName, fallbackPrice, 'Freshly declared estate blossom', parsedCapacity, userId]
        );
        resolvedFlowerId = insF.insertId;
        await pool.query(
          'INSERT INTO inventory (flower_id, stock_quantity, reorder_level) VALUES (?, ?, 30)',
          [resolvedFlowerId, parsedCapacity]
        );
      }
    } else if (resolvedFlowerId && !resolvedName) {
      const [fRows] = await pool.query('SELECT name FROM flowers WHERE flower_id = ? LIMIT 1', [resolvedFlowerId]);
      if (fRows.length > 0) resolvedName = fRows[0].name;
    }

    const [existing] = await pool.query(
      'SELECT supplier_flower_id AS id FROM supplier_flowers WHERE (supplier_user_id = ? OR supplier_id = ?) AND flower_id = ?',
      [userId, userId, resolvedFlowerId]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE supplier_flowers SET supply_capacity = COALESCE(supply_capacity, 0) + ?, flower_name = ?, updated_at = CURRENT_TIMESTAMP WHERE supplier_flower_id = ?',
        [parsedCapacity, resolvedName, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO supplier_flowers (supplier_id, supplier_user_id, flower_id, flower_name, supply_price, supply_capacity) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, userId, resolvedFlowerId, resolvedName, fallbackPrice, parsedCapacity]
      );
    }

    // Sync stock_quantity in both flowers & inventory if flower already existed
    if (!isNewFlower) {
      await pool.query('UPDATE flowers SET stock_quantity = COALESCE(stock_quantity, 0) + ? WHERE flower_id = ?', [parsedCapacity, resolvedFlowerId]);
      const [invCheck] = await pool.query('SELECT inventory_id FROM inventory WHERE flower_id = ?', [resolvedFlowerId]);
      if (invCheck.length > 0) {
        await pool.query('UPDATE inventory SET stock_quantity = COALESCE(stock_quantity, 0) + ?, last_restocked = CURRENT_TIMESTAMP WHERE flower_id = ?', [parsedCapacity, resolvedFlowerId]);
      } else {
        await pool.query('INSERT INTO inventory (flower_id, stock_quantity, reorder_level) VALUES (?, ?, 30)', [resolvedFlowerId, parsedCapacity]);
      }
    }

    return res.json({
      success: true,
      message: `Successfully declared ${parsedCapacity} stems of ${resolvedName}`,
      declared: {
        supplier_user_id: userId,
        flower_id: resolvedFlowerId,
        flower_name: resolvedName,
        supply_capacity: parsedCapacity
      }
    });
  } catch (error) {
    console.error('Post Declared Flowers Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update declared variety capacity (set exact capacity)
app.put(['/api/suppliers/declared-flowers/:id', '/api/suppliers/:userId/declared-flowers/:id'], async (req, res) => {
  const declId = parseInt(req.params.id, 10);
  const { supply_capacity, capacity } = req.body;
  const newCap = parseInt(supply_capacity !== undefined ? supply_capacity : capacity, 10);
  if (isNaN(declId) || declId <= 0 || isNaN(newCap) || newCap <= 0) {
    return res.status(400).json({ success: false, message: 'Valid declaration ID and positive capacity are required' });
  }
  try {
    const userId = req.params.userId ? await resolveSupplierIdFlexible(req.params.userId) : null;
    const whereClause = userId ? 'WHERE supplier_flower_id = ? AND (supplier_user_id = ? OR supplier_id = ?)' : 'WHERE supplier_flower_id = ?';
    const params = userId ? [newCap, declId, userId, userId] : [newCap, declId];
    const [result] = await pool.query(`UPDATE supplier_flowers SET supply_capacity = ?, updated_at = CURRENT_TIMESTAMP ${whereClause}`, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Declared flower variety not found' });
    }
    return res.json({ success: true, message: 'Supply capacity updated to ' + newCap + ' stems / cycle' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Remove declared variety from supplier_flowers
app.delete(['/api/suppliers/declared-flowers/:id', '/api/suppliers/:userId/declared-flowers/:id'], async (req, res) => {
  const declId = parseInt(req.params.id, 10);
  if (isNaN(declId) || declId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid declaration ID' });
  }
  try {
    const userId = req.params.userId ? await resolveSupplierIdFlexible(req.params.userId) : null;
    const whereClause = userId ? 'WHERE supplier_flower_id = ? AND (supplier_user_id = ? OR supplier_id = ?)' : 'WHERE supplier_flower_id = ?';
    const params = userId ? [declId, userId, userId] : [declId];
    const [result] = await pool.query(`DELETE FROM supplier_flowers ${whereClause}`, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Declared flower variety not found' });
    }
    return res.json({ success: true, message: 'Declared variety removed' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Real Supplier Demand, Low Stock Insights & Completed Orders/Payments (scoped per supplier_id)
app.get(['/api/suppliers/demand', '/api/supplier/demand'], async (req, res) => {
  try {
    const rawSup = req.query.supplier_id || req.query.user_id || req.query.supplierId;
    let flWhere = '';
    let flParams = [];
    let ordWhere = '';
    let ordParams = [];
    let spWhere = '';
    let spParams = [];

    if (rawSup !== undefined && String(rawSup).trim() !== '') {
      const sid = await resolveSupplierIdFlexible(rawSup);
      if (!sid || sid <= 0) {
        return res.json({
          success: true,
          low_stock_alerts: [],
          top_demanded: [],
          completed_payments: [],
          total_payouts: 0,
          total_payouts_formatted: 'Rs. 0',
          forecasts: []
        });
      }
      const flFilter = buildSupplierFlowerPredicate('f', sid);
      flWhere = `WHERE ${flFilter.clause}`;
      flParams = flFilter.params;

      const ordFilter = buildSupplierOrderPredicate('o', sid);
      ordWhere = `AND ${ordFilter.clause}`;
      ordParams = ordFilter.params;

      spWhere = 'AND sp.supplier_id = ?';
      spParams = [sid];
    }

    const [inventoryAlerts] = await pool.query(`
      SELECT 
        f.flower_id, 
        f.name AS flower_name, 
        f.category, 
        COALESCE(f.stock_quantity, inv.stock_quantity, 0) AS stock_quantity, 
        COALESCE(inv.reorder_level, 30) AS reorder_level,
        f.unit_price
      FROM flowers f
      LEFT JOIN (
        SELECT flower_id, MAX(stock_quantity) AS stock_quantity, MAX(reorder_level) AS reorder_level
        FROM inventory
        GROUP BY flower_id
      ) inv ON f.flower_id = inv.flower_id
      ${flWhere}
      ORDER BY (COALESCE(f.stock_quantity, inv.stock_quantity, 0) - COALESCE(inv.reorder_level, 30)) ASC,
               COALESCE(f.stock_quantity, inv.stock_quantity, 0) ASC
    `, flParams);

    const criticalAlerts = inventoryAlerts
      .filter(item => Number(item.stock_quantity) <= Number(item.reorder_level))
      .map(item => ({ ...item, alert_status: 'LOW_STOCK', alert_label: 'Low Stock' }));

    let lowStock = criticalAlerts;
    if (criticalAlerts.length < 2) {
      const approachingAlerts = inventoryAlerts
        .filter(item => {
          const stock = Number(item.stock_quantity);
          const reorder = Number(item.reorder_level);
          const nearCeiling = Math.max(reorder + 20, Math.round(reorder * 1.8));
          return stock > reorder && stock <= nearCeiling;
        })
        .slice(0, 2 - criticalAlerts.length)
        .map(item => ({ ...item, alert_status: 'NEAR_REORDER', alert_label: 'Near Reorder' }));
      lowStock = [...criticalAlerts, ...approachingAlerts];
    }

    const [topDemanded] = await pool.query(`
      SELECT 
        f.flower_id, 
        f.name AS flower_name, 
        f.category, 
        COALESCE(SUM(oi.quantity), 0) AS total_ordered_stems,
        COALESCE(f.stock_quantity, inv.stock_quantity, 0) AS current_stock
      FROM flowers f
      LEFT JOIN order_items oi ON f.flower_id = oi.flower_id
      LEFT JOIN (
        SELECT flower_id, MAX(stock_quantity) AS stock_quantity
        FROM inventory
        GROUP BY flower_id
      ) inv ON f.flower_id = inv.flower_id
      ${flWhere}
      GROUP BY f.flower_id, f.name, f.category, f.stock_quantity, inv.stock_quantity
      ORDER BY total_ordered_stems DESC
      LIMIT 6
    `, flParams);

    const [completedPayments] = await pool.query(`
      SELECT * FROM (
        SELECT
          o.order_id AS supplier_payment_id,
          o.order_id AS place_order_id,
          CASE WHEN o.order_code LIKE '#%' THEN o.order_code ELSE CONCAT('#', COALESCE(o.order_code, CONCAT('PB-', o.order_id))) END AS order_code,
          COALESCE(inv.total_amount, oi_totals.items_total, 0) AS amount,
          CONCAT('Rs. ', FORMAT(COALESCE(inv.total_amount, oi_totals.items_total, 0), 0)) AS amount_formatted,
          CASE UPPER(COALESCE(pay.payment_method, 'BANK_TRANSFER'))
            WHEN 'CARD' THEN 'Card Payment'
            WHEN 'CASH' THEN 'Cash Settlement'
            ELSE 'Bank Transfer'
          END AS payment_method,
          COALESCE(inv.invoice_number, CONCAT('PAY-', pay.payment_id), CONCAT('ORD-', o.order_id)) AS payment_reference,
          COALESCE(pay.payment_date, inv.issue_date, o.order_date) AS payment_date,
          'COMPLETED' AS status
        FROM orders o
        LEFT JOIN (
          SELECT order_id, MAX(invoice_id) AS invoice_id, MAX(invoice_number) AS invoice_number, MAX(total_amount) AS total_amount, MAX(issue_date) AS issue_date
          FROM invoices
          GROUP BY order_id
        ) inv ON o.order_id = inv.order_id
        LEFT JOIN (
          SELECT invoice_id, MAX(payment_id) AS payment_id, MAX(payment_method) AS payment_method, MAX(payment_date) AS payment_date
          FROM payments
          GROUP BY invoice_id
        ) pay ON inv.invoice_id = pay.invoice_id
        LEFT JOIN (
          SELECT order_id, SUM(quantity * price) AS items_total
          FROM order_items
          GROUP BY order_id
        ) oi_totals ON o.order_id = oi_totals.order_id
        WHERE (UPPER(COALESCE(o.status, '')) = 'DELIVERED'
           OR UPPER(COALESCE(o.fulfilment_status, '')) = 'DELIVERED')
          ${ordWhere}

        UNION ALL

        SELECT
          (100000 + sp.supplier_payment_id) AS supplier_payment_id,
          sp.place_order_id,
          CONCAT('#PB-BATCH-', sp.place_order_id) AS order_code,
          sp.amount,
          CONCAT('Rs. ', FORMAT(sp.amount, 0)) AS amount_formatted,
          CASE UPPER(COALESCE(sp.payment_method, 'BANK_TRANSFER'))
            WHEN 'CASH' THEN 'Cash Settlement'
            ELSE 'Bank Transfer'
          END AS payment_method,
          CONCAT('BATCH-', sp.supplier_payment_id) AS payment_reference,
          sp.payment_date,
          sp.status
        FROM supplier_payments sp
        WHERE UPPER(COALESCE(sp.status, '')) = 'COMPLETED'
          ${spWhere}
      ) combined_payouts
      ORDER BY payment_date DESC, supplier_payment_id DESC
    `, [...ordParams, ...spParams]);

    const totalPayouts = completedPayments.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalPayoutsFormatted = 'Rs. ' + Math.round(totalPayouts).toLocaleString('en-US');

    // Dynamically calculate seasonal demand forecasts alongside live current stock scoped by supplier
    const [forecasts] = await pool.query(`
      SELECT
        COALESCE(MAX(df.forecast_id), f.flower_id) AS forecast_id,
        f.flower_id,
        f.name AS flower_name,
        COALESCE(MAX(df.season_event), 'Next 30 Days') AS season_event,
        (COALESCE(MAX(df.predicted_demand), 0) + COALESCE(SUM(oi.quantity), 0)) AS predicted_demand,
        COALESCE(SUM(oi.quantity), 0) AS live_ordered_stems,
        COALESCE(f.stock_quantity, inv.stock_quantity, 0) AS current_stock,
        f.unit_price,
        COALESCE(MAX(df.forecast_date), NOW()) AS forecast_date
      FROM flowers f
      LEFT JOIN order_items oi ON f.flower_id = oi.flower_id
      LEFT JOIN demand_forecasts df ON f.flower_id = df.flower_id
      LEFT JOIN (
        SELECT flower_id, MAX(stock_quantity) AS stock_quantity
        FROM inventory
        GROUP BY flower_id
      ) inv ON f.flower_id = inv.flower_id
      ${flWhere}
      GROUP BY f.flower_id, f.name, f.unit_price, f.stock_quantity, inv.stock_quantity
      HAVING predicted_demand > 0
      ORDER BY live_ordered_stems DESC, predicted_demand DESC
      LIMIT 6
    `, flParams);

    return res.json({
      success: true,
      low_stock_alerts: lowStock,
      top_demanded: topDemanded,
      completed_payments: completedPayments,
      total_payouts: totalPayouts,
      total_payouts_formatted: totalPayoutsFormatted,
      forecasts: forecasts
    });
  } catch (error) {
    console.error('Get Supplier Demand Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Check supplier approval status
app.get('/api/supplier/status/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT s.supplier_id, s.supplier_code, s.supplier_name, s.city, s.monthly_capacity, s.is_approved, u.status, u.name, u.email
       FROM suppliers s
       LEFT JOIN users u ON s.supplier_id = u.user_id
       WHERE s.supplier_id = ? OR u.user_id = ? OR LOWER(COALESCE(s.supplier_code, '')) = LOWER(?) OR s.supplier_name = ?
       LIMIT 1`,
      [id, id, id, id]
    );

    if (rows.length === 0) {
      const [userRows] = await pool.query(
        'SELECT user_id, name, email, status FROM users WHERE user_id = ? AND role = "SUPPLIER"',
        [id]
      );
      if (userRows.length > 0) {
        const u = userRows[0];
        const isAppr = u.status === 'ACTIVE' ? 1 : 0;
        return res.json({
          success: true,
          supplier_id: u.user_id,
          supplier_code: `SUP-2026-${String(u.user_id).padStart(4, '0')}`,
          supplier_name: u.name,
          farm_name: u.name,
          city: '',
          monthly_capacity: 0,
          is_approved: isAppr,
          status: isAppr === 1 ? 'Approved' : (u.status === 'REJECTED' ? 'Rejected' : 'Pending')
        });
      }
      return res.status(404).json({ success: false, message: 'Supplier record not found' });
    }

    const s = rows[0];
    const isAppr = Number(s.is_approved) === 1 ? 1 : 0;
    const finalStatus = isAppr === 1 ? 'Approved' : (String(s.status || '').toUpperCase() === 'REJECTED' ? 'Rejected' : 'Pending');

    return res.json({
      success: true,
      supplier_id: s.supplier_id,
      supplier_code: s.supplier_code || `SUP-2026-${String(s.supplier_id).padStart(4, '0')}`,
      supplier_name: s.supplier_name || s.name,
      farm_name: s.supplier_name || s.name,
      city: s.city || '',
      monthly_capacity: s.monthly_capacity || 0,
      is_approved: isAppr,
      status: finalStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Declare flower types & quantities / capacity
app.post('/api/supplier/declare-flowers', async (req, res) => {
  const { supplier_id, flower_id, flower_name, supply_price, capacity } = req.body;
  try {
    const suppId = parseInt(supplier_id, 10);
    if (isNaN(suppId) || suppId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid supplier_id is required' });
    }

    let resolvedFlowerId = flower_id;
    let resolvedPrice = parseFloat(supply_price) || 0;
    const capInt = Math.max(0, parseInt(capacity, 10) || 0);

    // If flower_name is passed, match or insert into flowers
    if (!resolvedFlowerId && flower_name) {
      const [fRows] = await pool.query('SELECT flower_id, unit_price FROM flowers WHERE LOWER(name) = LOWER(?) OR name LIKE ? LIMIT 1', [flower_name.trim(), `%${flower_name.trim()}%`]);
      if (fRows.length > 0) {
        resolvedFlowerId = fRows[0].flower_id;
        if (!supply_price) resolvedPrice = parseFloat(fRows[0].unit_price) || 0;
        if (capInt > 0) {
          await pool.query('UPDATE flowers SET stock_quantity = COALESCE(stock_quantity, 0) + ? WHERE flower_id = ?', [capInt, resolvedFlowerId]);
          await pool.query('UPDATE inventory SET stock_quantity = COALESCE(stock_quantity, 0) + ?, last_restocked = CURRENT_TIMESTAMP WHERE flower_id = ?', [capInt, resolvedFlowerId]);
        }
      } else {
        const initialStock = capInt;
        const [insF] = await pool.query(
          'INSERT INTO flowers (name, category, color, unit_price, description, stock_quantity, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [flower_name.trim(), flower_name.trim(), 'Multi', resolvedPrice, 'Locally declared farm blossom', initialStock, suppId]
        );
        resolvedFlowerId = insF.insertId;
        await pool.query(
          'INSERT INTO inventory (flower_id, stock_quantity, reorder_level) VALUES (?, ?, 30)',
          [resolvedFlowerId, initialStock]
        );
      }
    }

    if (!resolvedFlowerId) {
      return res.status(400).json({ success: false, message: 'Flower name or flower_id is required' });
    }

    // Check if supplier_flowers row exists
    const [existing] = await pool.query(
      'SELECT * FROM supplier_flowers WHERE (supplier_id = ? OR supplier_user_id = ?) AND flower_id = ?',
      [suppId, suppId, resolvedFlowerId]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE supplier_flowers SET supply_price = ?, supply_capacity = COALESCE(supply_capacity, 0) + ? WHERE supplier_flower_id = ?',
        [resolvedPrice, capInt, existing[0].supplier_flower_id]
      );
    } else {
      await pool.query(
        'INSERT INTO supplier_flowers (supplier_id, supplier_user_id, flower_id, flower_name, supply_price, supply_capacity) VALUES (?, ?, ?, ?, ?, ?)',
        [suppId, suppId, resolvedFlowerId, flower_name || '', resolvedPrice, capInt]
      );
    }

    if (capInt > 0) {
      await pool.query(
        'UPDATE suppliers SET monthly_capacity = COALESCE(monthly_capacity, 0) + ? WHERE supplier_id = ?',
        [capInt, suppId]
      );
    }

    return res.json({
      success: true,
      message: 'Flower type declared successfully in your farm catalog!',
      flower_id: resolvedFlowerId
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to query real supplier dashboard & profile data from MySQL
const getSupplierDashboardData = async (rawSupplierId) => {
  const idParam = String(rawSupplierId || '').trim();
  const numericId = parseInt(idParam, 10);

  let [rows] = await pool.query(
    `SELECT u.user_id, u.name AS user_name, u.email, u.phone AS user_phone, u.status AS user_status, u.role AS user_role,
            s.supplier_id, s.supplier_code, s.supplier_name, s.contact_number, s.city, s.address, s.monthly_capacity, s.is_approved
     FROM users u
     LEFT JOIN suppliers s ON s.supplier_id = u.user_id
     WHERE UPPER(u.role) = 'SUPPLIER'
       AND (u.user_id = ? OR s.supplier_id = ? OR LOWER(COALESCE(s.supplier_code, '')) = LOWER(?))
     LIMIT 1`,
    [isNaN(numericId) ? -1 : numericId, isNaN(numericId) ? -1 : numericId, idParam]
  );

  // Fallback only if a suppliers row exists without a linked users row
  if (rows.length === 0 && !isNaN(numericId) && numericId > 0) {
    const [supOnly] = await pool.query(
      `SELECT s.supplier_id AS user_id, s.supplier_name AS user_name, '' AS email, s.contact_number AS user_phone,
              CASE WHEN s.is_approved = 1 THEN 'ACTIVE' ELSE 'PENDING' END AS user_status, 'SUPPLIER' AS user_role,
              s.supplier_id, s.supplier_code, s.supplier_name, s.contact_number, s.city, s.address, s.monthly_capacity, s.is_approved
       FROM suppliers s
       LEFT JOIN users u ON s.supplier_id = u.user_id
       WHERE s.supplier_id = ? AND (u.role IS NULL OR UPPER(u.role) = 'SUPPLIER')
       LIMIT 1`,
      [numericId]
    );
    rows = supOnly;
  }

  if (rows.length === 0) {
    return null;
  }

  const supplier = rows[0];
  const resolvedSupplierId = supplier.supplier_id || supplier.user_id;
  const isApproved = supplier.supplier_id != null
    ? (Number(supplier.is_approved) === 1)
    : (String(supplier.user_status || '').toUpperCase() === 'ACTIVE');
  const statusStr = isApproved ? 'Approved' : (String(supplier.user_status || '').toUpperCase() === 'REJECTED' ? 'Rejected' : 'Pending');
  const supplierCode = (supplier.supplier_code && supplier.supplier_code.trim())
    ? supplier.supplier_code.trim()
    : `SUP-2026-${String(resolvedSupplierId).padStart(4, '0')}`;

  const ordFilter = buildSupplierOrderPredicate('o', resolvedSupplierId);
  const flFilter = buildSupplierFlowerPredicate('f', resolvedSupplierId);

  // 1. Real New Requests count scoped to this supplier (PENDING only)
  const [newReqRows] = await pool.query(
    `SELECT COUNT(*) AS c FROM orders o WHERE UPPER(COALESCE(o.status, '')) = 'PENDING' AND ${ordFilter.clause}`,
    ordFilter.params
  );
  const newRequestsCount = Number(newReqRows[0]?.c || 0);

  // 2. Real Active Orders count scoped to this supplier
  const [activeOrdRows] = await pool.query(
    `SELECT COUNT(*) AS c FROM orders o
     WHERE UPPER(COALESCE(o.status, '')) IN ('ACCEPTED', 'CONFIRMED', 'PREPARING', 'READY', 'DISPATCHED', 'SHIPPED')
       AND UPPER(COALESCE(o.fulfilment_status, '')) NOT IN ('DELIVERED', 'CANCELLED')
       AND ${ordFilter.clause}`,
    ordFilter.params
  );
  const activeOrdersCount = Number(activeOrdRows[0]?.c || 0);

  // 3. Real Supplied Varieties count scoped to this supplier's flowers / declared varieties
  const [varietyRows] = await pool.query(
    `SELECT COUNT(DISTINCT f.flower_id) AS c FROM flowers f WHERE ${flFilter.clause}`,
    flFilter.params
  );
  const suppliedVarieties = Number(varietyRows[0]?.c || 0);

  // 4. Real Total Payouts scoped to this supplier: DELIVERED orders + completed batch settlements
  const [deliveredEarnRows] = await pool.query(`
    SELECT COALESCE(SUM(COALESCE(inv.total_amount, oi_totals.items_total, 0)), 0) AS delivered_total
    FROM orders o
    LEFT JOIN (
      SELECT order_id, MAX(total_amount) AS total_amount
      FROM invoices
      GROUP BY order_id
    ) inv ON o.order_id = inv.order_id
    LEFT JOIN (
      SELECT order_id, SUM(quantity * price) AS items_total
      FROM order_items
      GROUP BY order_id
    ) oi_totals ON o.order_id = oi_totals.order_id
    WHERE (UPPER(COALESCE(o.status, '')) = 'DELIVERED'
       OR UPPER(COALESCE(o.fulfilment_status, '')) = 'DELIVERED')
      AND ${ordFilter.clause}
  `, ordFilter.params);
  const deliveredOrdersTotal = parseFloat(deliveredEarnRows[0]?.delivered_total || 0);

  const [batchEarnRows] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS batch_total FROM supplier_payments WHERE UPPER(COALESCE(status, '')) = 'COMPLETED' AND supplier_id = ?`,
    [resolvedSupplierId]
  );
  const batchSettlementTotal = parseFloat(batchEarnRows[0]?.batch_total || 0);
  const totalPayouts = deliveredOrdersTotal + batchSettlementTotal;

  // 5. Latest live supplier notification summary, recent alerts (top 2), & exact count from MySQL feed
  let latestNotification = `${newRequestsCount} pending request(s) and ${activeOrdersCount} active order(s) in queue.`;
  let alertsCount = 0;
  let recentAlerts = [];
  try {
    const feed = await getSupplierNotificationsFeed(resolvedSupplierId);
    alertsCount = feed.length;
    recentAlerts = feed.slice(0, 2);
    if (feed.length > 0) {
      const top = feed[0];
      latestNotification = `${top.title} · ${top.subtitle}`;
    }
  } catch (_) {}

  return {
    success: true,
    supplier_id: resolvedSupplierId,
    supplier_code: supplierCode,
    supplier_name: supplier.supplier_name || supplier.user_name || '',
    contact_person: supplier.user_name || supplier.supplier_name || '',
    email: supplier.email || '',
    phone: supplier.contact_number || supplier.user_phone || '',
    city: supplier.city || '',
    address: supplier.address || '',
    is_approved: isApproved,
    status: statusStr,
    new_requests_count: newRequestsCount,
    active_orders_count: activeOrdersCount,
    supplied_varieties_count: suppliedVarieties,
    total_payouts: totalPayouts,
    total_payouts_formatted: 'Rs. ' + Math.round(totalPayouts).toLocaleString('en-US'),
    monthly_capacity: Number(supplier.monthly_capacity || 0),
    latest_notification: latestNotification,
    recent_alerts: recentAlerts,
    alerts_count: alertsCount,
    notifications_count: alertsCount,
    unread_notifications: alertsCount
  };
};

// Supplier Dashboard metrics (supports both /api/supplier/dashboard/:id and /api/suppliers/:id/dashboard)
app.get(['/api/supplier/dashboard/:supplierId', '/api/suppliers/:supplierId/dashboard'], async (req, res) => {
  try {
    const data = await getSupplierDashboardData(req.params.supplierId);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    return res.json(data);
  } catch (error) {
    console.error('Supplier Dashboard Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Supplier Profile endpoints (GET and PUT)
app.get(['/api/supplier/profile/:supplierId', '/api/suppliers/:supplierId/profile'], async (req, res) => {
  try {
    const data = await getSupplierDashboardData(req.params.supplierId);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }
    return res.json({
      success: true,
      profile: {
        user_id: data.supplier_id,
        supplier_id: data.supplier_id,
        supplier_code: data.supplier_code,
        supplier_name: data.supplier_name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        city: data.city,
        address: data.address,
        is_approved: data.is_approved,
        status: data.status,
        monthly_capacity: data.monthly_capacity,
        total_payouts: data.total_payouts,
        total_payouts_formatted: data.total_payouts_formatted,
        active_orders: data.active_orders_count,
        supplied_varieties: data.supplied_varieties_count
      }
    });
  } catch (error) {
    console.error('Supplier Profile Get Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.put(['/api/supplier/profile/:supplierId', '/api/suppliers/:supplierId/profile'], async (req, res) => {
  const supplierId = parseInt(req.params.supplierId, 10);
  const { supplier_name, contact_person, phone, city, address, monthly_capacity } = req.body;
  if (isNaN(supplierId) || supplierId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid supplier ID' });
  }
  try {
    const [uCheck] = await pool.query('SELECT user_id, role FROM users WHERE user_id = ? LIMIT 1', [supplierId]);
    const [sCheck] = await pool.query('SELECT * FROM suppliers WHERE supplier_id = ? LIMIT 1', [supplierId]);

    if (uCheck.length > 0 && String(uCheck[0].role || '').toUpperCase() !== 'SUPPLIER' && sCheck.length === 0) {
      return res.status(403).json({ success: false, message: 'User is not a registered supplier' });
    }
    if (uCheck.length === 0 && sCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    if (phone !== undefined && String(phone).trim() && !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }
    const cleanName = contact_person !== undefined ? String(contact_person).trim() : null;
    const cleanPhone = phone !== undefined ? String(phone).trim() : null;
    const cleanFarm = supplier_name !== undefined ? String(supplier_name).trim() : null;
    const cleanCity = city !== undefined ? String(city).trim() : null;
    const cleanAddress = address !== undefined ? String(address).trim() : null;
    const cleanCapacity = (monthly_capacity !== undefined && monthly_capacity !== null && !isNaN(parseInt(monthly_capacity, 10)))
      ? Math.max(0, parseInt(monthly_capacity, 10))
      : null;

    // Update users table
    if (uCheck.length > 0) {
      await pool.query(
        'UPDATE users SET name = COALESCE(NULLIF(?, ""), name), phone = COALESCE(?, phone) WHERE user_id = ?',
        [cleanName, cleanPhone, supplierId]
      );
    }

    // Update or insert suppliers table
    if (sCheck.length > 0) {
      await pool.query(
        `UPDATE suppliers 
         SET supplier_name = COALESCE(NULLIF(?, ""), supplier_name),
             contact_number = COALESCE(?, contact_number),
             city = COALESCE(?, city),
             address = COALESCE(?, address),
             monthly_capacity = COALESCE(?, monthly_capacity)
         WHERE supplier_id = ?`,
        [cleanFarm, cleanPhone, cleanCity, cleanAddress, cleanCapacity, supplierId]
      );
    } else {
      const code = `SUP-2026-${String(supplierId).padStart(4, '0')}`;
      await pool.query(
        `INSERT INTO suppliers (supplier_id, supplier_code, supplier_name, contact_number, city, address, monthly_capacity, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [supplierId, code, cleanFarm || cleanName || '', cleanPhone || '', cleanCity || '', cleanAddress || '', cleanCapacity || 0]
      );
    }

    const updated = await getSupplierDashboardData(supplierId);
    return res.json({ success: true, message: 'Supplier profile updated successfully', profile: updated });
  } catch (error) {
    console.error('Supplier Profile Update Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Sourcing orders for supplier
app.get('/api/supplier/orders/:supplierId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT po.place_order_id, po.inventory_id, po.quantity, po.unit_price, po.order_date, po.status,
             f.flower_id, f.name AS flower_name, f.category, f.color, f.image_url
      FROM place_orders po
      JOIN inventory i ON po.inventory_id = i.inventory_id
      JOIN flowers f ON i.flower_id = f.flower_id
      ORDER BY po.order_date DESC
    `);
    return res.json({ success: true, requests: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update sourcing order status (Accept / Reject)
app.put('/api/supplier/orders/:placeOrderId/status', async (req, res) => {
  const { placeOrderId } = req.params;
  const { status } = req.body;
  try {
    const validStatuses = ['PENDING', 'ACCEPTED', 'RECEIVED', 'REJECTED'];
    const newStatus = (status || '').toUpperCase();
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    await pool.query('UPDATE place_orders SET status = ? WHERE place_order_id = ?', [newStatus, placeOrderId]);
    return res.json({ success: true, message: `Order #${placeOrderId} updated to ${newStatus}` });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Harvest record & Fulfilment
app.post('/api/supplier/harvest-fulfilment', async (req, res) => {
  const { place_order_id, harvested_qty, notes } = req.body;
  try {
    const pId = place_order_id || 1;
    const qty = parseInt(harvested_qty, 10) || 0;

    const [poRows] = await pool.query('SELECT inventory_id, quantity FROM place_orders WHERE place_order_id = ?', [pId]);
    if (poRows.length > 0 && qty > 0) {
      const invId = poRows[0].inventory_id;
      await pool.query('UPDATE place_orders SET status = "RECEIVED" WHERE place_order_id = ?', [pId]);
      await pool.query('UPDATE inventory SET stock_quantity = stock_quantity + ?, last_restocked = CURRENT_TIMESTAMP WHERE inventory_id = ?', [qty, invId]);
      await pool.query(
        'UPDATE flowers f JOIN inventory i ON f.flower_id = i.flower_id SET f.stock_quantity = COALESCE(f.stock_quantity, 0) + ? WHERE i.inventory_id = ?',
        [qty, invId]
      );
      await pool.query('UPDATE supplier_payments SET status = "COMPLETED" WHERE place_order_id = ?', [pId]);
    }

    return res.json({
      success: true,
      message: `Harvest of ${qty} stems recorded and inventory synced!`
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Demand forecasts endpoint
app.get('/api/demand-forecasts', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT df.forecast_id, df.flower_id, df.season_event, df.predicted_demand, df.unit_price, df.forecast_date,
             f.name AS flower_name, f.category, f.color
      FROM demand_forecasts df
      JOIN flowers f ON df.flower_id = f.flower_id
      ORDER BY df.forecast_date DESC
    `);
    return res.json({ success: true, forecasts: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Customer Payment History & Methods from MySQL
app.get('/api/customers/:customerId/payment-methods', async (req, res) => {
  const customerId = parseInt(req.params.customerId, 10);
  if (isNaN(customerId) || customerId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid customer ID' });
  }
  try {
    const [payments] = await pool.query(
      `SELECT p.payment_id, p.amount_paid, p.payment_method, p.payment_date, p.status,
              i.invoice_number, o.order_id, o.order_code
       FROM payments p
       JOIN invoices i ON p.invoice_id = i.invoice_id
       JOIN orders o ON i.order_id = o.order_id
       WHERE o.customer_id = ?
       ORDER BY p.payment_date DESC, p.payment_id DESC
       LIMIT 15`,
      [customerId]
    );
    const [custRows] = await pool.query(
      'SELECT COALESCE(bonus_wallet, 0) AS bonus_wallet FROM customers WHERE customer_id = ? LIMIT 1',
      [customerId]
    );
    return res.json({
      success: true,
      bonus_wallet: parseFloat(custRows[0]?.bonus_wallet || 0),
      payments
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load payment records', error: error.message });
  }
});

/* ==========================================================
   5. REVIEWS & RATINGS
   ========================================================== */
app.post('/api/reviews', async (req, res) => {
  const { order_id, order_code, customer_id, flower_id, rating, comment } = req.body;
  const custId = parseInt(customer_id, 10);
  const ratingVal = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
  const cleanComment = (comment || '').trim();

  if (isNaN(custId) || custId <= 0) {
    return res.status(400).json({ success: false, message: 'Valid customer_id is required' });
  }
  if (!cleanComment) {
    return res.status(400).json({ success: false, message: 'Review comment is required' });
  }

  try {
    let resolvedOrderId = parseInt(order_id, 10);
    if (isNaN(resolvedOrderId) || resolvedOrderId <= 0) {
      resolvedOrderId = 0;
    }

    // Resolve matching order from MySQL by order_id or order_code
    const rawCode = String(order_code || order_id || '').replace(/^#/, '').trim();
    const [ordRows] = await pool.query(
      'SELECT order_id FROM orders WHERE order_id = ? OR order_code = ? OR order_code = ? LIMIT 1',
      [resolvedOrderId, rawCode, `PB-${rawCode}`]
    );
    if (ordRows.length > 0) {
      resolvedOrderId = ordRows[0].order_id;
    }

    if (resolvedOrderId <= 0) {
      return res.status(404).json({ success: false, message: 'Matching order not found in MySQL' });
    }

    let resolvedFlowerId = parseInt(flower_id, 10);
    if (isNaN(resolvedFlowerId) || resolvedFlowerId <= 0) {
      const [itemRows] = await pool.query(
        'SELECT flower_id FROM order_items WHERE order_id = ? ORDER BY order_item_id ASC LIMIT 1',
        [resolvedOrderId]
      );
      if (itemRows.length > 0) {
        resolvedFlowerId = itemRows[0].flower_id;
      }
    }

    if (!resolvedFlowerId || resolvedFlowerId <= 0) {
      return res.status(400).json({ success: false, message: 'No flower item found for this order' });
    }

    await pool.query(
      'INSERT INTO rating_reviews (order_id, customer_id, flower_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [resolvedOrderId, custId, resolvedFlowerId, ratingVal, cleanComment]
    );
    return res.json({ success: true, message: 'Review recorded successfully', order_id: resolvedOrderId, flower_id: resolvedFlowerId });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server on all network interfaces (0.0.0.0) so physical Android phone can connect
app.listen(PORT, '0.0.0.0', () => {
  const ifaces = os.networkInterfaces();
  const lanUrls = [];
  for (const name of Object.keys(ifaces)) {
    for (const addr of ifaces[name] || []) {
      if (addr.family === 'IPv4' && !addr.internal && !addr.address.startsWith('169.254.')) {
        lanUrls.push(`http://${addr.address}:${PORT} (${name})`);
      }
    }
  }
  console.log(`===================================================`);
  console.log(`🌸 Petalio Blossom REST API Server is running!`);
  console.log(`🌐 Local:   http://localhost:${PORT}`);
  if (lanUrls.length > 0) {
    lanUrls.forEach((u) => console.log(`📱 Android: ${u}`));
  }
  console.log(`===================================================`);
});
