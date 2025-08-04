// models/Employee.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database');
module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    employees_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING
    },

    specification: {
      type: DataTypes.ENUM('technician', 'supervisor', 'manager'),
      allowNull: false,
      defaultValue: 'technician'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: true,
      defaultValue: 'active'
    }
  }, {
    tableName: 'employees',
    timestamps: false
  });

  return Employee;
};
