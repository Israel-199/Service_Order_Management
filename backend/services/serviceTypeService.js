const { Op } = require('sequelize');
const { Employee, Customer, ServiceType } = require('../models'); // Assuming these models are defined
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search'); 
// const { Category } = require('../models'); // Assuming Category model is defined



class ServiceTypeService {
  // Create a new service type
  async createServiceType(data) {
    return await ServiceType.create(data);
  }

  // Update an existing service type by ID
  async updateServiceType(serviceTypeId, updateData) {
    const serviceType = await ServiceType.findByPk(serviceTypeId);
    if (!serviceType) throw new Error('Service type not found');
    return await serviceType.update(updateData);
  }

  // Delete a service type by ID
  async deleteServiceType(serviceTypeId) {
    const serviceType = await ServiceType.findByPk(serviceTypeId);
    if (!serviceType) throw new Error('Service type not found');
    await serviceType.destroy();
    return { message: 'Service type deleted successfully' };
  }

  // Get all service types with pagination, search, and sorting
  async getAllServiceTypes(queryParams) {
    const { limit, offset, order, page } = parsePagination(queryParams);
    const search = queryParams.search || queryParams.q || null;

    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { slug: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await ServiceType.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return {
      service_types: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

module.exports = new ServiceTypeService();