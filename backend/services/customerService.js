const { Customer, Sequelize } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search');

const { Op } = Sequelize;

class CustomerService {
  /**
   * Fetch paginated/sorted/searched customers.
   * Query params supported:
   *  - page, limit, sortBy, sortOrder
   *  - search (free-text search)
   */
  async getAllCustomers(query) {
    const {
      limit,
      offset,
      sortBy = 'customer_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const search = query.search || query.q || null;

    const whereClause = search
      ? buildSearchCondition(['name', 'email', 'company', 'phone'], search)
      : {};

    const { rows: customers, count: total } = await Customer.findAndCountAll({
      where: whereClause,
      attributes: [
        ['customer_id', 'id'],
        'name',
        'email',
        'phone',
        'company',
        'address',
        'tin_number',
        'created_at',
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id) {
    return await Customer.findByPk(id, {
      attributes: [
        ['customer_id', 'id'],
        'name',
        'email',
        'phone',
        'company',
        'address',
        'tin_number',
        'created_at',
      ],
    });
  }

  async createCustomer(data) {
    return await Customer.create(data);
  }

  async updateCustomer(id, data) {
    const customer = await Customer.findByPk(id);
    if (!customer) throw new Error('Customer not found');
    return await customer.update(data);
  }

  async deleteCustomer(id) {
    const customer = await Customer.findByPk(id);
    if (!customer) throw new Error('Customer not found');
    await customer.destroy();
    return { message: 'Customer deleted successfully' };
  }
}

module.exports = new CustomerService();
