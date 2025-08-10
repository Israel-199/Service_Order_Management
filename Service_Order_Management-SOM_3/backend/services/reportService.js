const { ServiceOrder, Sequelize } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search');

const { Op } = Sequelize;

class ReportService {
  _throwError(message, statusCode = 404) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }

  async getServiceOrderReport(query) {
    const {
      limit,
      offset,
      sortBy = 'created_at',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const search = query.search || query.q || null;

    // Build flexible search condition on fields
    const where = search
      ? buildSearchCondition(['description', 'status', 'priority'], search)
      : {};

    // Add extra filters if needed
    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }

    const { rows, count } = await ServiceOrder.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      attributes: ['service_order_id', 'description', 'status', 'priority', 'created_at'],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

module.exports = new ReportService();
