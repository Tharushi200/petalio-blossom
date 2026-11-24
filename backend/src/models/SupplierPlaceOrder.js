const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplierPlaceOrder = sequelize.define('SupplierPlaceOrder', {
  supplier_place_order_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  place_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'FULFILLED'),
    defaultValue: 'PENDING',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'supplier_place_orders',
  timestamps: false,
});

module.exports = SupplierPlaceOrder;
