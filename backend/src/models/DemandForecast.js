const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DemandForecast = sequelize.define('DemandForecast', {
  forecast_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  flower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  season_event: {
    type: DataTypes.STRING(50),
    defaultValue: 'Normal',
  },
  predicted_demand: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 300.00,
  },
  forecast_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'demand_forecasts',
  timestamps: false,
});

module.exports = DemandForecast;
