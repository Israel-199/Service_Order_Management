const customerService = require('../services/customerService');
const { validationResult } = require('express-validator');

class CustomerController {
  // 🔒 Private helper for validating request body
  #handleValidation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return false;
    }
    return true;
  }

  // GET /customers
  async getAllCustomers(req, res, next) {
    try {
      const result = await customerService.getAllCustomers(req.query);
      res.status(200).json({ message: 'Customers fetched successfully', ...result });
    } catch (error) {
      next(error);
    }
  }

  // GET /customers/:customer_id
  async getCustomerById(req, res, next) {
    try {
      const { customer_id } = req.params;
      const customer = await customerService.getCustomerById(customer_id);
      if (!customer) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Customer not found',
        });
      }
      res.status(200).json({ message: 'Customer details retrieved', customer });
    } catch (error) {
      next(error);
    }
  }

  // POST /customers
  async createCustomer(req, res, next) {
    if (!this.#handleValidation(req, res)) return;

    try {
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json({
        message: 'Customer created successfully',
        customer_id: customer.customer_id,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /customers/:customer_id
  async updateCustomer(req, res, next) {
    if (!this.#handleValidation(req, res)) return;

    try {
      const { customer_id } = req.params;
      await customerService.updateCustomer(customer_id, req.body);
      res.status(200).json({ message: 'Customer updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /customers/:customer_id
  async deleteCustomer(req, res, next) {
    try {
      const { customer_id } = req.params;
      await customerService.deleteCustomer(customer_id);
      res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
