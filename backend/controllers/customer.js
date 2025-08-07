const customerService = require('../services/customerService');

class CustomerController {

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
    try {
      const { name, email, phone, company, address, tin_number } = req.body;

      if(!name || !email || !phone || !company || !address || !tin_number) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'All fields are required',
        });
      }
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({ field: 'email', message: 'Email is invalid' });
      }

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

    try {
      const { customer_id } = req.params;
      const { name, email, phone, company, address, tin_number } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid email format',
      });
    }
    
     await customerService.updateCustomer(customer_id, {
      name, email, phone, company, address, tin_number
    });
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
