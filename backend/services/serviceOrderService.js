const { ServiceOrder, Sequelize } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search');

const { Op } = Sequelize;

class ServiceOrderService {
  _throwError(message, statusCode = 404) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }

  async _getOrderOrThrow(id) {
    const order = await ServiceOrder.findByPk(id);
    if (!order) this._throwError('Service Order not found');
    return order;
  }

  /**
   * Fetch paginated, sorted, searched service orders
   */
  async getAllServiceOrders(query) {
    const {
      limit,
      offset,
      sortBy = 'service_order_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const search = query.search || query.q || null;
    const where = search
      ? buildSearchCondition(['description', 'status', 'priority'], search)
      : {};

    const { rows: orders, count: total } = await ServiceOrder.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getServiceOrderById(id) {
    return this._getOrderOrThrow(id);
  }

  async createServiceOrder(data) {
    return ServiceOrder.create(data);
  }

  async updateServiceOrder(id, data) {
    const order = await this._getOrderOrThrow(id);
    return order.update(data);
  }

  async deleteServiceOrder(id) {
    const order = await this._getOrderOrThrow(id);
    await order.destroy();
    return { message: 'Service Order deleted successfully' };
  }
}

module.exports = new ServiceOrderService();
