const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    defaultValue: 'ORD-1001',
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  officer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  order_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  season_event: {
    type: DataTypes.STRING(50),
    defaultValue: 'Normal',
  },
  delivery_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  delivery_city: {
    type: DataTypes.STRING(50),
    defaultValue: 'Colombo',
  },
  payment_status: {
    type: DataTypes.ENUM('UNPAID', 'PAID'),
    defaultValue: 'UNPAID',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
}, {
  tableName: 'orders',
  timestamps: false,
});

module.exports = Order;
