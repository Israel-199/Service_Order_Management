const { ServiceType } = require('../models');
const { Op } = require('sequelize');
const { parsePagination } = require('../utils/pagination');
const { formatPaginatedResponse } = require('../utils/formatter');

class ServiceTypeService {
  _throwError(message, statusCode = 404) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }

  async _getServiceTypeOrThrow(id) {
    const serviceType = await ServiceType.findByPk(id);
    if (!serviceType) this._throwError('Service type not found');
    return serviceType;
  }

  // Create new service type
  async createServiceType(data) {
    return ServiceType.create(data);
  }

  // Update an existing service type by ID
  async updateServiceType(id, updateData) {
    const serviceType = await this._getServiceTypeOrThrow(id);
    return serviceType.update(updateData);
  }

  // Get all service types with pagination, search, and sorting
  async getAllServiceTypes(query) {
    const {
      limit,
      offset,
      sortBy = 'created_at',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const search = query.search || null;

    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { slug: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { rows, count } = await ServiceType.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return formatPaginatedResponse(rows, { total: count, page, limit });
  }

  // Get single service type by ID
  async getServiceTypeById(id) {
    return this._getServiceTypeOrThrow(id);
  }
}

module.exports = new ServiceTypeService();
