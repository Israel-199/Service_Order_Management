// controllers/customer.js

const customerService = require('../services/customerService');
const { validationResult } = require('express-validator');
/**
 //CustomerController handles customer-related requests
 // It includes methods for getting all customers, getting a customer by ID,
 // creating a new customer, updating an existing customer, and deleting a customer.
 // Each method interacts with the customerService for business logic and returns JSON responses.
 // The controller is used in the customerRoutes file to define the routes.
*/

class CustomerController {  
  // GET /customers
  async getAllCustomers(req, res, next) {
    try {
      // Validate query parameters
      const { limit, page } = req.query;
      if (limit && (isNaN(limit) || parseInt(limit, 10) <= 0)) {
        return res.status(400).json({ error: 'Limit must be a positive integer' });
      }
      if (page && (isNaN(page) || parseInt(page, 10) <= 0)) {
        return res.status(400).json({ error: 'Page must be a positive integer' });
      }

      const result = await customerService.getAllCustomers(req.query);

      // Ensure consistent response even if no customers are found
      res.status(200).json({
        message: 'Customers fetched successfully',
        customers: result.customers || [],
        pagination: result.pagination || {
          total: 0,
          page: parseInt(page, 10) || 1,
          limit: parseInt(limit, 10) || 10,
          totalPages: 0,
        },
      });
    } catch (error) {
      // Specific error handling for known service errors
      if (error.message.includes('Invalid search condition')) {
        return res.status(400).json({ error: error.message });
      }
      next(error); // Pass other errors to error-handling middleware
    }
  }

  // GET /customers/:customer_id
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

  // POST /customers
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
 
  // PUT /customers/:customer_id
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

  // DELETE /customers/:customer_id
  async deleteCustomer(req, res, next) {
    try {
      await customerService.deleteCustomer(req.params.customer_id);
      res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByName(req, res, next) {
    try {
      const data = await customerService.getCustomersByName(req.params.name, req.query);
      res.status(200).json({ message: 'Customers fetched by name', ...data });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByEmail(req, res, next) {
    try {
      const data = await customerService.getCustomersByEmail(req.params.email, req.query);
      res.status(200).json({ message: 'Customers fetched by email', ...data });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByPhone(req, res, next) {
    try {
      const data = await customerService.getCustomersByPhone(req.params.phone, req.query);
      res.status(200).json({ message: 'Customers fetched by phone', ...data });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByCompany(req, res, next) {
    try {
      const data = await customerService.getCustomersByCompany(req.params.company, req.query);
      res.status(200).json({ message: 'Customers fetched by company', ...data });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByAddress(req, res, next) {
    try {
      const data = await customerService.getCustomersByAddress(req.params.address, req.query);
      res.status(200).json({ message: 'Customers fetched by address', ...data });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByTinNumber(req, res, next) {
    try {
      const data = await customerService.getCustomersByTinNumber(req.params.tinNumber, req.query);
      res.status(200).json({ message: 'Customers fetched by TIN number', ...data });
    } catch (error) {
      next(error);
    }
  }


  async getCustomerOrders(req, res, next) {
    try {
      const customerId = req.params.customerId;
      const orders = await customerService.getCustomerOrders(customerId);
      res.status(200).json({
        message: 'Customer orders fetched successfully',
        data: orders,
      });
    } catch (error) {
      if (error.message === 'Invalid customer ID') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Customer not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error); // Pass other errors to error-handling middleware
    }
  }
}

module.exports = new CustomerController();
