const employeeService = require('../services/employeeService');
const { validationResult } = require('express-validator');

/**
 * EmployeeController handles employee-related requests
 * It includes methods for getting all employees, getting an employee by ID,
 * creating a new employee, updating an existing employee, and deleting an employee.
 * Each method interacts with the employeeService for business logic and returns JSON responses.
 * The controller is used in the employeeRoutes file to define the routes.
 */
class EmployeeController {

  // GET /employees
  // GET /employees? page,limit,sortBy,order,q,tags
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
      const employee = await employeeService.getEmployeeById(req.params.employee_id);
      if (!employee) {
        return res.status(404).json({ error: 'Not Found', message: 'Employee not found' });
      }
      res.status(200).json({ message: 'Employee details retrieved', employee });
    } catch (error) {
      next(error);
    }
  }


  // POST /employees
  // POST /employees? name, email, phone, specification
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


  // PUT /employees/:employee_id
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


  // GET /employees/email/:email
  async getEmployeeByEmail(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeByEmail(req.params.email);
      if (!employee) {
        return res.status(404).json({ error: 'Not Found', message: 'Employee not found' });
      }
      res.status(200).json({ message: 'Employee retrieved by email', employee });
    } catch (error) {
      next(error);
    }
  }

  // GET /employees/phone/:phone
  async getEmployeeByPhone(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeByPhone(req.params.phone);
      if (!employee) {
        return res.status(404).json({ error: 'Not Found', message: 'Employee not found' });
      }
      res.status(200).json({ message: 'Employee retrieved by phone', employee });
    } catch (error) {
      next(error);
    }
  }

  // GET /employees/name/:name (partial match)
  async getEmployeeByName(req, res, next) {
    try {
      const employees = await employeeService.getEmployeeByName(req.params.name);
      if (!employees || employees.length === 0) {
        return res.status(404).json({ error: 'Not Found', message: 'No employees match the name' });
      }
      res.status(200).json({ message: 'Employees retrieved by name', employees });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /employees/:employee_id
  async deleteEmployee(req, res, next) {
    try {
      await employeeService.deleteEmployee(req.params.employee_id);
      res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeesByServiceTypeId (req, res, next) {
    try {
      const { service_type_id } = req.params;
      const employees = await employeeService.getEmployeesByServiceTypeId(service_type_id, req.query);
      res.json(employees);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeesByServiceOrderId (req, res, next) {
    try {
      const { service_order_id } = req.params;
      const employees = await employeeService.getEmployeesByServiceOrderId(service_order_id, req.query);
      res.json(employees);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
