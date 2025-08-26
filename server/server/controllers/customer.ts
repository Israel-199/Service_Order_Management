import { Request, Response, NextFunction } from 'express';
import customerService from '../services/customerService';
import { validationResult } from 'express-validator';

class CustomerController {
  // GET /customers
  async getAllCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, page } = req.query;
      // Validate limit and page if provided
      if (limit && (isNaN(Number(limit)) || Number(limit) <= 0)) {
        return res.status(400).json({ error: 'Limit must be a positive number' });
      }
      if (page && (isNaN(Number(page)) || Number(page) <= 0)) {
        return res.status(400).json({ error: 'Page must be a positive number' });
      }

      const result = await customerService.getAllCustomers(req.query);
      res.status(200).json({
        message: 'Customers fetched successfully',
        customers: result.items,  // Changed from result.customers to result.items
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /customers/:id
  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }

      const customer = await customerService.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.status(200).json({ message: 'Customer details retrieved', customer });
    } catch (error) {
      next(error);
    }
  }

  // POST /customers
  async createCustomer(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json({ message: 'Customer created successfully', customer });
    } catch (error) {
      next(error);
    }
  }

  // PUT /customers/:id
  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }

      const updatedCustomer = await customerService.updateCustomer(id, req.body);
      res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer });
    } catch (error) {
      if ((error as Error).message === 'Customer not found') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      next(error);
    }
  }

  // DELETE /customers/:id
  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }

      await customerService.deleteCustomer(id);
      res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      if ((error as Error).message === 'Customer not found') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      next(error);
    }
  }

  // Additional filtering methods (by name, email, phone, etc.)
  async getCustomersByName(req: Request, res: Response, next: NextFunction) {
    try {
      const name = req.params.name;
      const data = await customerService.getCustomersByName(name, req.query);
      res.status(200).json({ message: 'Customers fetched by name', ...data });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.params.email;
      const data = await customerService.getCustomersByEmail(email, req.query);
      res.status(200).json({ message: 'Customers fetched by email', ...data });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const phone = req.params.phone;
      const data = await customerService.getCustomersByPhone(phone, req.query);
      res.status(200).json({ message: 'Customers fetched by phone', ...data });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const company = req.params.company;
      const data = await customerService.getCustomersByCompany(company, req.query);
      res.status(200).json({ message: 'Customers fetched by company', ...data });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersByAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = req.params.address;
      const data = await customerService.getCustomersByAddress(address, req.query);
      res.status(200).json({ message: 'Customers fetched by address', ...data });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();