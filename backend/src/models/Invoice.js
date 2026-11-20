const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  invoice_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('UNPAID', 'PAID', 'CANCELLED'),
    defaultValue: 'UNPAID',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'invoices',
  timestamps: false,
});

module.exports = Invoice;
