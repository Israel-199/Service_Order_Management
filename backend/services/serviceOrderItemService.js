const { Employee, Sequelize } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search');
const { Op } = Sequelize;

class EmployeeService {
async getServiceOrderItemsByServiceOrderId(orderId) {
  const items = await ServiceOrderItem.findAll({
    where: { order_id: orderId },
    include: [
      {
        model: ServiceType,
        attributes: ['service_type_id', 'name', 'description'],
      }
    ]
  });

  return items;
}
async getServiceOrderItemsByServiceTypeId(serviceTypeId) {
  const items = await ServiceOrderItem.findAll({
    where: { service_type_id: serviceTypeId },
    include: [
      {
        model: ServiceOrder,
        attributes: ['order_id', 'description', 'priority', 'status'],
      }
    ]
  });

  return items;
}
}

module.exports = new EmployeeService();
