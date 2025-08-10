const { DataTypes } = require('sequelize');
const sequelize = require('../database');

module.exports = (sequelize, DataTypes) => {
  const ServiceOrderAssignment = sequelize.define('ServiceOrderAssignment', {
    assignment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employees_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role_in_order: {
      type: DataTypes.STRING(50),
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    unassigned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'service_order_assignments',
    timestamps: false,
  });

  return ServiceOrderAssignment;
};
