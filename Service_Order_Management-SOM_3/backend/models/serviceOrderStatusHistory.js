const { DataTypes } = require('sequelize');
const sequelize = require('../database');


module.exports = (sequelize, DataTypes) => {
  const ServiceOrderStatusHistory = sequelize.define('ServiceOrderStatusHistory', {
    history_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    old_status: {
      type: DataTypes.ENUM('new', 'assigned', 'in_progress', 'completed', 'closed'),
      allowNull: true,
    },
    new_status: {
      type: DataTypes.ENUM('new', 'assigned', 'in_progress', 'completed', 'closed'),
      allowNull: false,
    },
    changed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'service_order_status_history',
    timestamps: false,
  });

  return ServiceOrderStatusHistory;
};
