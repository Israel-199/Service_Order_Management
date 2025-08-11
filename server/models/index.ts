// models/index.ts
import { Sequelize } from 'sequelize';
import sequelize from '../config/database';

// Import model classes and init functions
import { Customer, initCustomer } from './customer';
import { Employee, initEmployee } from './employee';
import { ServiceType, initServiceType } from './serviceType';
import { ServiceOrder, initServiceOrder } from './serviceOrder';
import { Attachment, initAttachment } from './attachment';
import { RecurringOrder, initRecurringOrder } from './recurringOrder';
import { ServiceOrderItem, initServiceOrderItem } from './serviceOrderItem';
import {
  ServiceOrderAssignment,
  initServiceOrderAssignment,
} from './serviceOrderAssignment';
import {
  ServiceOrderStatusHistory,
  initServiceOrderStatusHistory,
} from './serviceOrderStatusHistory';
import { EmployeeServiceType, initEmployeeServiceType } from './employeeServiceType';
import { Notification, initNotification } from './notification';

// Initialize models
const CustomerModel = initCustomer(sequelize);
const EmployeeModel = initEmployee(sequelize);
const ServiceTypeModel = initServiceType(sequelize);
const ServiceOrderModel = initServiceOrder(sequelize);
const AttachmentModel = initAttachment(sequelize);
const RecurringOrderModel = initRecurringOrder(sequelize);
const ServiceOrderItemModel = initServiceOrderItem(sequelize);
const ServiceOrderAssignmentModel = initServiceOrderAssignment(sequelize);
const ServiceOrderStatusHistoryModel = initServiceOrderStatusHistory(sequelize);
const EmployeeServiceTypeModel = initEmployeeServiceType(sequelize);
const NotificationModel = initNotification(sequelize);

// ==================== Associations ====================

// Customer -> ServiceOrder (one-to-many)
CustomerModel.hasMany(ServiceOrderModel, { foreignKey: 'customer_id' });
ServiceOrderModel.belongsTo(CustomerModel, { foreignKey: 'customer_id' });

// ServiceType -> ServiceOrder (one-to-many)
ServiceTypeModel.hasMany(ServiceOrderModel, { foreignKey: 'service_type_id' });
ServiceOrderModel.belongsTo(ServiceTypeModel, { foreignKey: 'service_type_id' });

// Employee (lead) -> ServiceOrder (one-to-many)
// NOTE: your ServiceOrder model uses `lead_employee_id` based on the model you shared earlier.
// Use that column name so associations map correctly.
EmployeeModel.hasMany(ServiceOrderModel, { foreignKey: 'lead_employee_id', as: 'leadOrders' });
ServiceOrderModel.belongsTo(EmployeeModel, {
  foreignKey: 'lead_employee_id',
  as: 'leadEmployee',
});

// ServiceOrder -> Attachment (one-to-many)
ServiceOrderModel.hasMany(AttachmentModel, { foreignKey: 'order_id' });
AttachmentModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });

// ServiceOrder -> RecurringOrder (one-to-many)
ServiceOrderModel.hasMany(RecurringOrderModel, { foreignKey: 'order_id' });
RecurringOrderModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });

// Employee <-> ServiceType (many-to-many) via employee_service_types (through model)
EmployeeModel.belongsToMany(ServiceTypeModel, {
  through: EmployeeServiceTypeModel,
  foreignKey: 'employee_id',     // employee_service_types.employee_id
  otherKey: 'service_type_id',
});
ServiceTypeModel.belongsToMany(EmployeeModel, {
  through: EmployeeServiceTypeModel,
  foreignKey: 'service_type_id',
  otherKey: 'employee_id',
});

// Also set explicit belongsTo for the through model (handy for queries)
EmployeeServiceTypeModel.belongsTo(EmployeeModel, { foreignKey: 'employee_id' });
EmployeeServiceTypeModel.belongsTo(ServiceTypeModel, { foreignKey: 'service_type_id' });
EmployeeModel.hasMany(EmployeeServiceTypeModel, { foreignKey: 'employee_id' });
ServiceTypeModel.hasMany(EmployeeServiceTypeModel, { foreignKey: 'service_type_id' });

// ServiceOrder -> ServiceOrderItem -> ServiceType
ServiceOrderModel.hasMany(ServiceOrderItemModel, { foreignKey: 'order_id' });
ServiceOrderItemModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });

ServiceTypeModel.hasMany(ServiceOrderItemModel, { foreignKey: 'service_type_id' });
ServiceOrderItemModel.belongsTo(ServiceTypeModel, { foreignKey: 'service_type_id' });

// ServiceOrder -> ServiceOrderAssignment -> Employee (many-to-many via assignment model)
// NOTE: your ServiceOrderAssignment model uses `employee_id` (plural) in the model you provided earlier.
// Use those names here so Sequelize can find the correct columns.
ServiceOrderModel.hasMany(ServiceOrderAssignmentModel, { foreignKey: 'order_id' });
ServiceOrderAssignmentModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });

EmployeeModel.hasMany(ServiceOrderAssignmentModel, { foreignKey: 'employee_id' });
ServiceOrderAssignmentModel.belongsTo(EmployeeModel, { foreignKey: 'employee_id' });

ServiceOrderModel.belongsToMany(EmployeeModel, {
  through: ServiceOrderAssignmentModel,
  foreignKey: 'order_id',
  otherKey: 'employee_id',
});
EmployeeModel.belongsToMany(ServiceOrderModel, {
  through: ServiceOrderAssignmentModel,
  foreignKey: 'employee_id',
  otherKey: 'order_id',
});

// ServiceOrder -> ServiceOrderStatusHistory -> Employee
// Use `changed_by` for the user who changed status (if your status history model uses that column).
// If your model actually uses 'employee_id' replace it accordingly — but `changed_by` is common.
ServiceOrderModel.hasMany(ServiceOrderStatusHistoryModel, { foreignKey: 'order_id' });
ServiceOrderStatusHistoryModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });
ServiceOrderStatusHistoryModel.belongsTo(EmployeeModel, { foreignKey: 'changed_by' });

// Notification <-> ServiceOrder
// Add both sides so includes work cleanly
ServiceOrderModel.hasMany(NotificationModel, { foreignKey: 'service_order_id' });
NotificationModel.belongsTo(ServiceOrderModel, { foreignKey: 'service_order_id' });

// ==================== Typings ====================
export interface DB {
  sequelize: Sequelize;
  Customer: typeof Customer;
  Employee: typeof Employee;
  ServiceType: typeof ServiceType;
  ServiceOrder: typeof ServiceOrder;
  Attachment: typeof Attachment;
  RecurringOrder: typeof RecurringOrder;
  ServiceOrderItem: typeof ServiceOrderItem;
  ServiceOrderAssignment: typeof ServiceOrderAssignment;
  ServiceOrderStatusHistory: typeof ServiceOrderStatusHistory;
  EmployeeServiceType: typeof EmployeeServiceType;
  Notification: typeof Notification;
}

// ==================== DB Object ====================
const db: DB = {
  sequelize,
  Customer: CustomerModel,
  Employee: EmployeeModel,
  ServiceType: ServiceTypeModel,
  ServiceOrder: ServiceOrderModel,
  Attachment: AttachmentModel,
  RecurringOrder: RecurringOrderModel,
  ServiceOrderItem: ServiceOrderItemModel,
  ServiceOrderAssignment: ServiceOrderAssignmentModel,
  ServiceOrderStatusHistory: ServiceOrderStatusHistoryModel,
  EmployeeServiceType: EmployeeServiceTypeModel,
  Notification: NotificationModel,
};

export { sequelize, db };
