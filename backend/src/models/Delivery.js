const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  delivery_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  delivery_code: {
    type: DataTypes.STRING(30),
    unique: true,
    allowNull: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  business_officer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'),
    defaultValue: 'SCHEDULED',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'deliveries',
  timestamps: false,
});

module.exports = Delivery;
