const { ServiceOrder, Sequelize } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search');

const { Op } = Sequelize;

class ServiceOrderService {
  async getAllServiceOrders(query) {
    const {
      limit,
      offset,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page,
    } = parsePagination(query);

    const search = query.search || query.q || null;

    const whereClause = search
      ? buildSearchCondition(search, [
          'description',
          'status',
          'priority',
        ])
      : {};

    const { rows: orders, count: total } = await ServiceOrder.findAndCountAll({
      where: whereClause,
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
    return await ServiceOrder.findByPk(id);
  }

  async createServiceOrder(data) {
    return await ServiceOrder.create(data);
  }

  async updateServiceOrder(id, data) {
    const order = await ServiceOrder.findByPk(id);
    if (!order) throw new Error('Service Order not found');
    return await order.update(data);
  }

  async deleteServiceOrder(id) {
    const order = await ServiceOrder.findByPk(id);
    if (!order) throw new Error('Service Order not found');
    await order.destroy();
    return { message: 'Service Order deleted successfully' };
  }
}

module.exports = new ServiceOrderService();
