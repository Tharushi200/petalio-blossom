const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  supplier_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  farm_name: {
    type: DataTypes.STRING(120),
    allowNull: false,
    defaultValue: 'Highland Flora Nursery',
  },
  contact_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING(60),
    defaultValue: 'Nuwara Eliya',
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  monthly_capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 15000,
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  registered_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'suppliers',
  timestamps: false,
});

module.exports = Supplier;
