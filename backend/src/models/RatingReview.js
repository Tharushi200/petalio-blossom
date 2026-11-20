const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RatingReview = sequelize.define('RatingReview', {
  review_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  review_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'rating_reviews',
  timestamps: false,
});

module.exports = RatingReview;
