// controllers/serviceType.js

//const { validationResult } = require('express-validator');
const serviceTypeService = require('../services/serviceTypeService');

/**
 * ServiceTypeController handles service type-related requests.
 * It includes methods for creating, updating, and retrieving service types.
 * Each method interacts with the serviceTypeService for business logic and returns JSON responses.
 * The controller is used in the serviceTypeRoutes file to define the routes.
 */
class ServiceTypeController {
  // GET /service-types
  // GET /service-types? page,limit,sort_by,order,search
  async getAllServiceTypes(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        order = 'DESC',
        search = ''
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const result = await serviceTypeService.getAllServiceTypes({
        limit: parseInt(limit),
        offset,
        order: [[sort_by, order.toUpperCase()]],
        search
      });

      res.status(200).json({
        message: 'Service types fetched successfully',
        ...result
      });
    } catch (err) {
      next(err);
    }
  } 

  // POST /service-types
  // POST /service-types? name, description, tags
  async createServiceType(req, res, next) {
    try {
      const data = req.body;
      const serviceType = await serviceTypeService.createServiceType(data);
      res.status(201).json({
        message: 'Service type created successfully',
        service_type: serviceType
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /service-types/:service_type_id
  // PUT /service-types/:service_type_id? name, description
  async updateServiceType(req, res, next) {
    try {
      const { service_type_id } = req.params;
      const updated = await serviceTypeService.updateServiceType(service_type_id, req.body);
      res.status(200).json({
        message: 'Service type updated successfully',
        service_type: updated
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /service-types/:service_type_id
  async deleteServiceType(req, res, next) {
    try {
      const { service_type_id } = req.params;
      await serviceTypeService.deleteServiceType(service_type_id);
      res.status(200).json({
        message: 'Service type deleted successfully'
      });
    } catch (err) {
      next(err);
    }  
  }

    // GET /service-types/name/:name
  async getServiceTypesByName(req, res, next) {
    try {
      const { name } = req.params;
      const { page = 1, limit = 10, sort_by = 'created_at', order = 'DESC' } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const result = await serviceTypeService.getServiceTypesByName(name, { page: parseInt(page), limit: parseInt(limit), offset, sortBy: sort_by, sortOrder: order.toUpperCase() });
      if (!result.serviceTypes.length) return res.status(404).json({ error: 'Not Found', message: 'No service types found with this name' });
      res.status(200).json({ message: 'Service types retrieved by name', ...result });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-types/slug/:slug
  async getServiceTypeBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const serviceType = await serviceTypeService.getServiceTypeBySlug(slug);
      if (!serviceType) return res.status(404).json({ error: 'Not Found', message: 'Service type not found' });
      res.status(200).json({ message: 'Service type retrieved by slug', service_type: serviceType });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-types/employee/:employeeId
  // Supports query params: page, limit, sort_by, order
  async getServiceTypesByEmployeeId(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { page = 1, limit = 10, sort_by = 'created_at', order = 'DESC' } = req.query;

      const result = await serviceTypeService.getServiceTypesByEmployeeId(employeeId, {
        page: parseInt(page),
        limit: parseInt(limit),
        order: [[sort_by, order.toUpperCase()]],
      });

      if (!result.service_types.length) {
        return res.status(404).json({ error: 'Not Found', message: 'No service types found for this employee' });
      }

      res.status(200).json({
        message: 'Service types retrieved for employee',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-types/customer/:customerId
  // Supports query params: page, limit, sort_by, order
  async getServiceTypesByCustomerId(req, res, next) {
    try {
      const { customerId } = req.params;
      const { page = 1, limit = 10, sort_by = 'created_at', order = 'DESC' } = req.query;

      const result = await serviceTypeService.getServiceTypesByCustomerId(customerId, {
        page: parseInt(page),
        limit: parseInt(limit),
        order: [[sort_by, order.toUpperCase()]],
      });

      if (!result.service_types.length) {
        return res.status(404).json({ error: 'Not Found', message: 'No service types found for this customer' });
      }

      res.status(200).json({
        message: 'Service types retrieved for customer',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}


module.exports = new ServiceTypeController();


