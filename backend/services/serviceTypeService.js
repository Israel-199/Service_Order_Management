const { ServiceType } = require('../models');
const { Op } = require('sequelize');

class ServiceTypeService {
  // Create new service type
  async createServiceType(data) {
    return await ServiceType.create(data);
  }

  // Update an existing service type by ID
  async updateServiceType(serviceTypeId, updateData) {
    const serviceType = await ServiceType.findByPk(serviceTypeId);
    if (!serviceType) throw new Error('Service type not found');
    return await serviceType.update(updateData);
  }

  // Get all service types with pagination, search, and sorting
  async getAllServiceTypes({ limit, offset, order, search }) {
    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { slug: { [Op.iLike]: `%${search}%` } }
          ]
        }
      : {};

    const { count, rows } = await ServiceType.findAndCountAll({
      where,
      limit,
      offset,
      order
    });

    return {
      total: count,
      page: Math.floor(offset / limit) + 1,
      service_types: rows
    };
  }

  // Get single service type by ID
  async getServiceTypeById(id) {
    return await ServiceType.findByPk(id);
  }
}

module.exports = new ServiceTypeService();
