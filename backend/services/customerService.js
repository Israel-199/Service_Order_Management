const { Customer, Sequelize } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search');

const { Op } = Sequelize;

class CustomerService {
  /**
   * Utility to throw a structured error
   */
  _throwError(message, statusCode = 404) {
    const err = new Error(message);
    err.statusCode = statusCode;
    throw err;
  }

  /**
   * Fetch customer by ID or throw error
   */
  async _getCustomerOrThrow(id) {
    const customer = await Customer.findByPk(id, {
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
    if (!customer) this._throwError('Customer not found');
    return customer;
  }

  /**
   * Fetch paginated/sorted/searched customers.
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
    const where = search
      ? buildSearchCondition(['name', 'email', 'company', 'phone'], search)
      : {};

    const { rows: customers, count: total } = await Customer.findAndCountAll({
      where,
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
    return this._getCustomerOrThrow(id);
  }

  async createCustomer(data) {
    return Customer.create(data);
  }

  async updateCustomer(id, data) {
    const customer = await Customer.findByPk(id);
    if (!customer) this._throwError('Customer not found');
    return customer.update(data);
  }

  async deleteCustomer(id) {
    const customer = await Customer.findByPk(id);
    if (!customer) this._throwError('Customer not found');
    await customer.destroy();
    return { message: 'Customer deleted successfully' };
  }
}

module.exports = new CustomerService();
