
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  customer_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(20) },
  company: { type: DataTypes.TEXT },
  address: { type: DataTypes.TEXT },
  tin_number: { type: DataTypes.STRING(50) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'customers',
  timestamps: false
});

module.exports = Customer;
