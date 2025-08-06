const employeeService = require('../services/employeeService');
const { validationResult } = require('express-validator');

class EmployeeController {
  // Private helper method for validation
  #handleValidation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return false;
    }
    return true;
  }

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
    if (!this.#handleValidation(req, res)) return;

    try {
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json({
        message: 'Employee created successfully',
        employee_id: employee.employee_id,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /employees/:employee_id
  async updateEmployee(req, res, next) {
    if (!this.#handleValidation(req, res)) return;

    try {
      const { employee_id } = req.params;
      await employeeService.updateEmployee(employee_id, req.body);
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
