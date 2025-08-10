const { DataTypes } = require('sequelize');
const sequelize = require('../database');

module.exports = (sequelize, DataTypes) => {
  const RecurringOrder = sequelize.define('RecurringOrder', {
    recurring_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recurrence_type: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
    },
    next_due_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'recurring_orders',
    timestamps: false,
  });

  return RecurringOrder;
};