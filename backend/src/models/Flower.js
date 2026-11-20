const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Flower = sequelize.define('Flower', {
  flower_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(50),
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
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'flowers',
  timestamps: false,
});

module.exports = Flower;
