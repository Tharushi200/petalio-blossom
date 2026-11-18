const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  invoice_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  invoice_number: {
    type: DataTypes.STRING(30),
    unique: true,
    allowNull: false,
    defaultValue: 'INV-2026-001',
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  customer_name: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  issue_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('UNPAID', 'PAID', 'CANCELLED'),
    defaultValue: 'UNPAID',
  },
}, {
  tableName: 'invoices',
  timestamps: false,
});

module.exports = Invoice;
