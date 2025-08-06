const { Employee, Sequelize } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search');

const { Op } = Sequelize;

class EmployeeService {
  _throwError(message, statusCode = 404) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }

  async _getEmployeeOrThrow(id) {
    const employee = await Employee.findByPk(id, {
      attributes: [
        ['employees_id', 'id'],
        'name',
        'email',
        'phone',
        'specification',
      ],
    });
    if (!employee) this._throwError('Employee not found');
    return employee;
  }

  /**
   * Fetch paginated, sorted, and searched employees
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
    const where = search
      ? buildSearchCondition(['name', 'email', 'phone', 'specification'], search)
      : {};

    const { rows: employees, count: total } = await Employee.findAndCountAll({
      where,
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
    return this._getEmployeeOrThrow(id);
  }

  async createEmployee(data) {
    return Employee.create(data);
  }

  async updateEmployee(id, data) {
    const employee = await Employee.findByPk(id);
    if (!employee) this._throwError('Employee not found');
    return employee.update(data);
  }

  async deleteEmployee(id) {
    const employee = await Employee.findByPk(id);
    if (!employee) this._throwError('Employee not found');
    await employee.destroy();
    return { message: 'Employee deleted successfully' };
  }
}

module.exports = new EmployeeService();
