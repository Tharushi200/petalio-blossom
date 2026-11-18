const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplierPayment = sequelize.define('SupplierPayment', {
  supplier_payment_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('BANK_TRANSFER', 'CASH'),
    defaultValue: 'BANK_TRANSFER',
  },
  payment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED'),
    defaultValue: 'COMPLETED',
  },
}, {
  tableName: 'supplier_payments',
  timestamps: false,
});

module.exports = SupplierPayment;
