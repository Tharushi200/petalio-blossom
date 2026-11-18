const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessOfficer = sequelize.define('BusinessOfficer', {
  officer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  contact_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING(80),
    defaultValue: 'Operations & Logistics',
  },
  assigned_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'business_officers',
  timestamps: false,
});

module.exports = BusinessOfficer;
