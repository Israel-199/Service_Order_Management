const employeeService = require('../services/employeeService');


class EmployeeController {

  // GET /employees
  async getAllEmployees(req, res, next) {
    try {
      const result = await employeeService.getAllEmployees(req.query);
      res.status(200).json({ message: 'Employees fetched successfully', ...result });
    } catch (error) {
      next(error);
    }
  }

  // GET /employees/:employee_id
  async getEmployeeById(req, res, next) {
    try {
      const { employee_id } = req.params;
      const employee = await employeeService.getEmployeeById(employee_id);
      if (!employee) {
        return res.status(404).json({ error: 'Not Found', message: 'Employee not found' });
      }
      res.status(200).json({ message: 'Employee details retrieved', employee });
    } catch (error) {
      next(error);
    }
  }

  // POST /employees
 async createEmployee(req, res, next) {
  try {
    const { name, email, phone, specification } = req.body;

    if (!name || !email || !specification) {
      return res.status(400).json({
        message: 'name, email, and specification fields are required.',
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid email format',
      });
    }
    const employee = await employeeService.createEmployee({
      name,
      email,
      phone,
      specification,
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee_id: employee.employees_id,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'Email already exists',
      });
    }

    next(error);
  }
}


  // PUT /employees/:employee_id
  async updateEmployee(req, res, next) {

    try {
    const { employee_id } = req.params;
    const { name, email, phone, specification } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid email format',
      });
    }

     await employeeService.updateEmployee(employee_id, {
      name,
      email,
      phone,
      specification,
    });
      res.status(200).json({ message: 'Employee updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /employees/:employee_id
  async deleteEmployee(req, res, next) {
    try {
      const { employee_id } = req.params;
      await employeeService.deleteEmployee(employee_id);
      res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
