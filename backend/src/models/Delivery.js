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
  vehicle_number: {
    type: DataTypes.STRING(50),
    defaultValue: 'Van #PB-01',
  },
  driver_name: {
    type: DataTypes.STRING(100),
    defaultValue: 'Kamal Bandara',
  },
  driver_phone: {
    type: DataTypes.STRING(20),
    defaultValue: '+94 77 123 4567',
  },
  destination_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  scheduled_date: {
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
