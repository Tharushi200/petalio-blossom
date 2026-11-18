const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplierCapacity = sequelize.define('SupplierCapacity', {
  capacity_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  flower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  flower_variety: {
    type: DataTypes.STRING(60),
    defaultValue: 'Standard',
  },
  flower_color: {
    type: DataTypes.STRING(40),
    defaultValue: 'White',
  },
  declared_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expected_yield_grade: {
    type: DataTypes.ENUM('A+', 'A', 'B'),
    defaultValue: 'A+',
  },
  harvest_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'COMMITTED', 'COMPLETED', 'REJECTED'),
    defaultValue: 'AVAILABLE',
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'supplier_capacity',
  timestamps: false,
});

module.exports = SupplierCapacity;
