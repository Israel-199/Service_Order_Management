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
        'specification',
      ],
    });
  }

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
}

module.exports = new EmployeeService();
