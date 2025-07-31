// controllers/customer.js

const customerService = require('../services/customerService');
const { validationResult } = require('express-validator');

class CustomerController {
  async getAllCustomers(req, res, next) {
    try {
      const result = await customerService.getAllCustomers(req.query);
      res.status(200).json({ message: 'Customers fetched successfully', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(req.params.customer_id);
      if (!customer) {
        return res.status(404).json({ error: 'Not Found', message: 'Customer not found' });
      }
      res.status(200).json({ message: 'Customer details retrieved', customer });
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json({ message: 'Customer created successfully', customer_id: customer.customer_id });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      await customerService.updateCustomer(req.params.customer_id, req.body);
      res.status(200).json({ message: 'Customer updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      await customerService.deleteCustomer(req.params.customer_id);
      res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
