const { Employee, Sequelize } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search');
const { Op } = Sequelize;

class EmployeeService {
  /**
   * Fetch paginated/sorted/searched employees.
   * Query params supported:
   *  - page, limit, sortBy, sortOrder
   *  - search (free-text search)
   */

  async createEmployee(data) {
    return await Employee.create(data);
  }

  async updateEmployee(id, data) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new Error('Employee not found');
    return await employee.update(data);
  }

  async deleteEmployee(id) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new Error('Employee not found');
    await employee.destroy();
    return { message: 'Employee deleted successfully' };
  }
  async getAllEmployees(query) {
    const {
      limit,
      offset,
      sortBy = 'employees_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const search = query.search || query.q || null;
    const whereClause = search
      ? buildSearchCondition(['name', 'email', 'phone', 'specification'], search)
      : {};

    const { rows: employees, count: total } = await Employee.findAndCountAll({
      where: whereClause,
      attributes: [
        ['employees_id', 'id'],
        'name',
        'email',
        'phone',
        'status',
        'specification',
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeById(id) {
    return await Employee.findByPk(id, {
      attributes: [
        ['employees_id', 'id'],
        'name',
        'email',
        'phone',
        'status',
        'specification',
      ],
    });
  }

  async getEmployeeByEmail(email) {
    return await Employee.findOne({
      where: {
        email: {
          [Op.like]: `%${email}%` // partial match anywhere in the string
        }
      },
      attributes: [
        ['employees_id', 'id'],
        'name',
        'email',
        'phone',
        'status',
        'specification',
      ],
    });
  }

  async getEmployeeByPhone(phone) {
    return await Employee.findOne({
    where: {phone},
      attributes: [
        ['employees_id', 'id'],
        'name',
        'email',
        'phone',
        'status',
        'specification',
      ],
    });
  }

async getEmployeeByName(name) {
  return await Employee.findAll({
    where: {
      name: {
        [Op.like]: `%${name}%` // partial match anywhere in the string
      }
    },
    attributes: [
      ['employees_id', 'id'],
      'name',
      'email',
      'phone',
      'status',
      'specification',
    ],
  });
}

  async getEmployeesByServiceTypeId(serviceTypeId, queryParams = {}) {
    const { limit, offset, order, page } = parsePagination(queryParams);

    const { count, rows } = await Employee.findAndCountAll({
      include: [{
        model: ServiceType,
        where: { service_type_id: serviceTypeId },
        through: { attributes: [] },
        required: true,
      }],
      order,
      limit,
      offset,
    });

    return {
      employees: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getEmployeesByServiceOrderId(orderId, queryParams = {}) {
    const { limit, offset, order, page } = parsePagination(queryParams);

    const { count, rows } = await Employee.findAndCountAll({
      include: [{
        model: ServiceOrder,
        through: { model: ServiceOrderAssignment, attributes: [] },
        where: { order_id: orderId },
        required: true,
      }],
      order,
      limit,
      offset,
    });

    return {
      employees: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

module.exports = new EmployeeService();
