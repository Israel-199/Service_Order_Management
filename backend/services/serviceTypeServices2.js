const { Op } = require('sequelize');
const { Employee, Customer, ServiceType } = require('../models');
const { parsePagination } = require('../utils/pagination');
const {
  buildSearchCondition,
  buildSearchConditionWithFields,
  buildSearchConditionWithSequelize
} = require('../utils/search');

class ServiceTypeService {
  async createServiceType(data) {
    return await ServiceType.create(data);
  }

  async updateServiceType(id, updateData) {
    const serviceType = await ServiceType.findByPk(id);
    if (!serviceType) throw new Error('Service type not found');
    return await serviceType.update(updateData);
  }

  async deleteServiceType(id) {
    const serviceType = await ServiceType.findByPk(id);
    if (!serviceType) throw new Error('Service type not found');
    await serviceType.destroy();
    return { message: 'Service type deleted successfully' };
  }

  async getAllServiceTypes(query) {
    const { limit, offset, sortBy='service_type_id', sortOrder='ASC', page } = parsePagination(query);
    const search = query.search || query.q || null;

    // Use buildSearchCondition to search across multiple fields
    const where = search
      ? buildSearchCondition(search, ['name', 'slug', 'description'], ServiceType)
      : {};

    const { count, rows } = await ServiceType.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    return {
      serviceTypes: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count/limit)
      }
    };
  }

  async getAllServiceTypesNoPagination() {
    return await ServiceType.findAll();
  }

  async getServiceTypeBySlug(slug) {
    return await ServiceType.findOne({ where: { slug } });
  }

  async getServiceTypesByName(name, query) {
    const { limit, offset, sortBy='service_type_id', sortOrder='ASC', page } = parsePagination(query);
    const where = { name: { [Op.iLike]: `%${name}%` } };

    const { count, rows } = await ServiceType.findAndCountAll({ where, order: [[sortBy, sortOrder]], limit, offset });
    return { serviceTypes: rows, pagination: { total: count, page, limit, totalPages: Math.ceil(count/limit) } };
  }

  async getServiceTypesByEmployeeId(employeeId) {
    return await ServiceType.findAll({ include: [{ model: Employee, where: { id: employeeId } }] });
  }

  async getServiceTypesByCustomerId(customerId) {
    return await ServiceType.findAll({ include: [{ model: Customer, where: { id: customerId } }] });
  }
}

module.exports = new ServiceTypeService();
