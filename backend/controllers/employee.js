const employeeService = require('../services/employeeService');
const { validationResult } = require('express-validator');

class EmployeeController {
  async getAllEmployees(req, res, next) {
    try {
      const result = await employeeService.getAllEmployees(req.query);
      res.status(200).json({ message: 'Employees fetched successfully', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.employee_id);
      if (!employee) {
        return res.status(404).json({ error: 'Not Found', message: 'Employee not found' });
      }
      res.status(200).json({ message: 'Employee details retrieved', employee });
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json({ message: 'Employee created successfully', employee_id: employee.employee_id });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      await employeeService.updateEmployee(req.params.employee_id, req.body);
      res.status(200).json({ message: 'Employee updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      await employeeService.deleteEmployee(req.params.employee_id);
      res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
