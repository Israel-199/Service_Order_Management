const serviceTypeService = require('../services/serviceTypeService');

class ServiceTypeController {
  // POST /service-types
  async createServiceType(req, res, next) {
    try {
      const data = req.body;
      const serviceType = await serviceTypeService.createServiceType(data);
      res.status(201).json({
        message: 'Service type created successfully',
        service_type: serviceType,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /service-types/:service_type_id
  async updateServiceType(req, res, next) {
    try {
      const { service_type_id } = req.params;
      const data = req.body;
      const updatedType = await serviceTypeService.updateServiceType(service_type_id, data);

      res.status(200).json({
        message: 'Service type updated successfully',
        service_type: updatedType,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-types
  async getAllServiceTypes(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        order = 'DESC',
        search = '',
      } = req.query;

      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const offset = (parsedPage - 1) * parsedLimit;

      const result = await serviceTypeService.getAllServiceTypes({
        limit: parsedLimit,
        offset,
        order: [[sort_by, order.toUpperCase()]],
        search,
      });

      res.status(200).json({
        message: 'Service types fetched successfully',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ServiceTypeController();
