const { DataTypes } = require('sequelize');
const sequelize = require('../database');

module.exports = (sequelize, DataTypes) => {
  const ServiceOrder = sequelize.define('ServiceOrder', {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'assigned', 'in_progress', 'completed', 'closed'),
      defaultValue: 'new',
    },
    lead_employees_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'service_orders',
    timestamps: false,
  });

  return ServiceOrder;
};
