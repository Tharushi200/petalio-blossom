const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlaceOrder = sequelize.define('PlaceOrder', {
  place_order_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  order_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'RECEIVED', 'REJECTED'),
    defaultValue: 'PENDING',
  },
}, {
  tableName: 'place_orders',
  timestamps: false,
});

module.exports = PlaceOrder;
