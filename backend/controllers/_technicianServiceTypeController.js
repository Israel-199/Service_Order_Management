const technicianServiceTypeService = require('../services/_technicianServiceTypeService');
const { validationResult } = require('express-validator');

class TechnicianServiceTypeController {
  async getAllTechnicianServiceTypes(req, res, next) {
    try {
      const mappings = await technicianServiceTypeService.getAllTechnicianServiceTypes();
      res.status(200).json({ message: 'Technician service types fetched successfully', mappings });
    } catch (error) {
      next(error);
    }
  }

  async getTechnicianServiceType(req, res, next) {
    const { lead_employees_id, service_type_id } = req.params;
    try {
      const mapping = await technicianServiceTypeService.getTechnicianServiceType(lead_employees_id, service_type_id);
      if (!mapping) {
        return res.status(404).json({ error: 'Not Found', message: 'Technician service type mapping not found' });
      }
      res.status(200).json({ message: 'Technician service type retrieved', mapping });
    } catch (error) {
      next(error);
    }
  }

  async createTechnicianServiceType(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const mapping = await technicianServiceTypeService.createTechnicianServiceType(req.body);
      res.status(201).json({ message: 'Technician service type created successfully', mapping });
    } catch (error) {
      next(error);
    }
  }

  async updateTechnicianServiceType(req, res, next) {
    const { lead_employees_id, service_type_id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const mapping = await technicianServiceTypeService.updateTechnicianServiceType(lead_employees_id, service_type_id, req.body);
      res.status(200).json({ message: 'Technician service type updated successfully', mapping });
    } catch (error) {
      next(error);
    }
  }

  async deleteTechnicianServiceType(req, res, next) {
    const { lead_employees_id, service_type_id } = req.params;
    try {
      await technicianServiceTypeService.deleteTechnicianServiceType(lead_employees_id, service_type_id);
      res.status(200).json({ message: 'Technician service type deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TechnicianServiceTypeController();