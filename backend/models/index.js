// models/index.js

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../database'); // ✅ Sequelize instance

const db = { sequelize, Sequelize };

// 1. Dynamically import all models (excluding index.js itself)
fs.readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== path.basename(__filename) &&
    file.slice(-3) === '.js'
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 2. Extract models
const {
  Customer,
  Employee,
  ServiceType,
  ServiceOrder,
  Attachment,
  RecurringOrder,
  ServiceOrderItem,
  ServiceOrderAssignment,
  ServiceOrderStatusHistory,
} = db;

// 3. Define associations between models

// Customer ↔ ServiceOrder
if (Customer && ServiceOrder) {
  Customer.hasMany(ServiceOrder, { foreignKey: 'customer_id' });
  ServiceOrder.belongsTo(Customer, { foreignKey: 'customer_id' });
}

// ServiceType ↔ ServiceOrder
if (ServiceType && ServiceOrder) {
  ServiceType.hasMany(ServiceOrder, { foreignKey: 'service_type_id' });
  ServiceOrder.belongsTo(ServiceType, { foreignKey: 'service_type_id' });
}

// Employee (Lead) ↔ ServiceOrder
if (Employee && ServiceOrder) {
  Employee.hasMany(ServiceOrder, { foreignKey: 'lead_employees_id' });
  ServiceOrder.belongsTo(Employee, {
    foreignKey: 'lead_employees_id',
    as: 'leadEmployee',
  });
}

// ServiceOrder ↔ Attachment
if (ServiceOrder && Attachment) {
  ServiceOrder.hasMany(Attachment, { foreignKey: 'order_id' });
  Attachment.belongsTo(ServiceOrder, { foreignKey: 'order_id' });
}

// ServiceOrder ↔ RecurringOrder
if (ServiceOrder && RecurringOrder) {
  ServiceOrder.hasMany(RecurringOrder, { foreignKey: 'order_id' });
  RecurringOrder.belongsTo(ServiceOrder, { foreignKey: 'order_id' });
}

// Employee ↔ ServiceType (Many-to-Many via technician_service_types)
if (Employee && ServiceType) {
  Employee.belongsToMany(ServiceType, {
    through: 'technician_service_types',
    foreignKey: 'technician_id',
    otherKey: 'service_type_id',
  });

  ServiceType.belongsToMany(Employee, {
    through: 'technician_service_types',
    foreignKey: 'service_type_id',
    otherKey: 'technician_id',
  });
}

// ServiceOrder ↔ ServiceOrderItem ↔ ServiceType
if (ServiceOrder && ServiceOrderItem && ServiceType) {
  ServiceOrder.hasMany(ServiceOrderItem, { foreignKey: 'order_id' });
  ServiceOrderItem.belongsTo(ServiceOrder, { foreignKey: 'order_id' });

  ServiceType.hasMany(ServiceOrderItem, { foreignKey: 'service_type_id' });
  ServiceOrderItem.belongsTo(ServiceType, { foreignKey: 'service_type_id' });
}

// ServiceOrder ↔ ServiceOrderAssignment ↔ Employee (Many-to-Many)
if (ServiceOrder && ServiceOrderAssignment && Employee) {
  ServiceOrder.hasMany(ServiceOrderAssignment, { foreignKey: 'order_id' });
  ServiceOrderAssignment.belongsTo(ServiceOrder, { foreignKey: 'order_id' });

  Employee.hasMany(ServiceOrderAssignment, { foreignKey: 'employees_id' });
  ServiceOrderAssignment.belongsTo(Employee, { foreignKey: 'employees_id' });

  ServiceOrder.belongsToMany(Employee, {
    through: ServiceOrderAssignment,
    foreignKey: 'order_id',
    otherKey: 'employees_id',
  });

  Employee.belongsToMany(ServiceOrder, {
    through: ServiceOrderAssignment,
    foreignKey: 'employees_id',
    otherKey: 'order_id',
  });
}

// ServiceOrder ↔ ServiceOrderStatusHistory ↔ Employee
if (ServiceOrder && ServiceOrderStatusHistory && Employee) {
  ServiceOrder.hasMany(ServiceOrderStatusHistory, { foreignKey: 'order_id' });
  ServiceOrderStatusHistory.belongsTo(ServiceOrder, { foreignKey: 'order_id' });

  ServiceOrderStatusHistory.belongsTo(Employee, {
    foreignKey: 'changed_by',
    allowNull: true,
  });
}

// 4. Export models and sequelize instance
module.exports = db;
