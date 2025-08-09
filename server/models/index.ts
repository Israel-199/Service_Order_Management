import { Sequelize } from 'sequelize';
import sequelize from '../config/database'; // Your configured Sequelize instance

// Import model classes and init functions
import { Customer, initCustomer } from './customer';
import { Employee, initEmployee } from './employee';
import { ServiceType, initServiceType } from './serviceType';
import { ServiceOrder, initServiceOrder } from './serviceOrder';
import { Attachment, initAttachment } from './attachment';
import { RecurringOrder, initRecurringOrder } from './recurringOrder';
import { ServiceOrderItem, initServiceOrderItem } from './serviceOrderItem';
import { ServiceOrderAssignment, initServiceOrderAssignment } from './serviceOrderAssignment';
import { ServiceOrderStatusHistory, initServiceOrderStatusHistory } from './serviceOrderStatusHistory';
import { TechnicianServiceType, initTechnicianServiceType } from './technicianServiceType';
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
const TechnicianServiceTypeModel = initTechnicianServiceType(sequelize);
const NotificationModel = initNotification(sequelize);

//

// Setup associations

// Customer ↔ ServiceOrder
CustomerModel.hasMany(ServiceOrderModel, { foreignKey: 'customer_id' });
ServiceOrderModel.belongsTo(CustomerModel, { foreignKey: 'customer_id' });

// ServiceType ↔ ServiceOrder
ServiceTypeModel.hasMany(ServiceOrderModel, { foreignKey: 'service_type_id' });
ServiceOrderModel.belongsTo(ServiceTypeModel, { foreignKey: 'service_type_id' });

// Employee (Lead) ↔ ServiceOrder
EmployeeModel.hasMany(ServiceOrderModel, { foreignKey: 'lead_employees_id' });
ServiceOrderModel.belongsTo(EmployeeModel, {
  foreignKey: 'lead_employees_id',
  as: 'leadEmployee',
});

// ServiceOrder ↔ Attachment
ServiceOrderModel.hasMany(AttachmentModel, { foreignKey: 'order_id' });
AttachmentModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });

// ServiceOrder ↔ RecurringOrder
ServiceOrderModel.hasMany(RecurringOrderModel, { foreignKey: 'order_id' });
RecurringOrderModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });

// Employee ↔ ServiceType (Many-to-Many via technician_service_types)
EmployeeModel.belongsToMany(ServiceTypeModel, {
  through: TechnicianServiceTypeModel,
  foreignKey: 'lead_employees_id',
  otherKey: 'service_type_id',
});
ServiceTypeModel.belongsToMany(EmployeeModel, {
  through: TechnicianServiceTypeModel,
  foreignKey: 'service_type_id',
  otherKey: 'lead_employees_id',
});

// TechnicianServiceType associations
TechnicianServiceTypeModel.belongsTo(EmployeeModel, { foreignKey: 'lead_employees_id' });
TechnicianServiceTypeModel.belongsTo(ServiceTypeModel, { foreignKey: 'service_type_id' });

// ServiceOrder ↔ ServiceOrderItem ↔ ServiceType
ServiceOrderModel.hasMany(ServiceOrderItemModel, { foreignKey: 'order_id' });
ServiceOrderItemModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });
ServiceTypeModel.hasMany(ServiceOrderItemModel, { foreignKey: 'service_type_id' });
ServiceOrderItemModel.belongsTo(ServiceTypeModel, { foreignKey: 'service_type_id' });

// ServiceOrder ↔ ServiceOrderAssignment ↔ Employee (Many-to-Many)
ServiceOrderModel.hasMany(ServiceOrderAssignmentModel, { foreignKey: 'order_id' });
ServiceOrderAssignmentModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });

EmployeeModel.hasMany(ServiceOrderAssignmentModel, { foreignKey: 'employees_id' });
ServiceOrderAssignmentModel.belongsTo(EmployeeModel, { foreignKey: 'employees_id' });

ServiceOrderModel.belongsToMany(EmployeeModel, {
  through: ServiceOrderAssignmentModel,
  foreignKey: 'order_id',
  otherKey: 'employees_id',
});
EmployeeModel.belongsToMany(ServiceOrderModel, {
  through: ServiceOrderAssignmentModel,
  foreignKey: 'employees_id',
  otherKey: 'order_id',
});

// ServiceOrder ↔ ServiceOrderStatusHistory ↔ Employee
ServiceOrderModel.hasMany(ServiceOrderStatusHistoryModel, { foreignKey: 'order_id' });
ServiceOrderStatusHistoryModel.belongsTo(ServiceOrderModel, { foreignKey: 'order_id' });
ServiceOrderStatusHistoryModel.belongsTo(EmployeeModel, { foreignKey: 'changed_by' });

// Notification ↔ ServiceOrder
NotificationModel.belongsTo(ServiceOrderModel, { foreignKey: 'service_order_id' });

// Define DB interface for typings
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
  TechnicianServiceType: typeof TechnicianServiceType;
  Notification: typeof Notification;
}

// Export db and sequelize
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
  TechnicianServiceType: TechnicianServiceTypeModel,
  Notification: NotificationModel,
};

export { sequelize, db };
