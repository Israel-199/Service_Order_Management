const serviceTypeService = require('../services/serviceTypeService');

class ServiceTypeController {
  // Create new service type
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

  // Update existing service type
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

  // Fetch all service types with pagination, search, and sorting
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
}

module.exports = new ServiceTypeController();
