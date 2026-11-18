const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  flower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  variety: {
    type: DataTypes.STRING(50),
    defaultValue: 'Standard',
  },
  color: {
    type: DataTypes.STRING(30),
    defaultValue: 'White',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
}, {
  tableName: 'order_items',
  timestamps: false,
});

module.exports = OrderItem;
