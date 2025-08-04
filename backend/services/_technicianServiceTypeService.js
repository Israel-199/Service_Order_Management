const { TechnicianServiceType, Employee, ServiceType } = require('../models');
const { sequelize } = require('../models');

class TechnicianServiceTypeService {
  async getAllTechnicianServiceTypes() {
    return await TechnicianServiceType.findAll({
      include: [
        { model: Employee, attributes: ['name', 'email'] },
        { model: ServiceType, attributes: ['name'] },
      ],
    });
  }

  async getTechnicianServiceType(lead_employees_id, service_type_id) {
    return await TechnicianServiceType.findOne({
      where: { lead_employees_id, service_type_id },
      include: [
        { model: Employee, attributes: ['name', 'email'] },
        { model: ServiceType, attributes: ['name'] },
      ],
    });
  }

  async createTechnicianServiceType(data) {
    const { lead_employees_id, service_type_id } = data;

    // Validate foreign keys
    const employee = await Employee.findByPk(lead_employees_id);
    if (!employee) throw new Error('Employee not found');
    const serviceType = await ServiceType.findByPk(service_type_id);
    if (!serviceType) throw new Error('Service type not found');

    // Check for existing mapping
    const existing = await TechnicianServiceType.findOne({
      where: { lead_employees_id, service_type_id },
    });
    if (existing) throw new Error('Mapping already exists');

    return await TechnicianServiceType.create(data);
  }

  async updateTechnicianServiceType(lead_employees_id, service_type_id, data) {
    const mapping = await TechnicianServiceType.findOne({
      where: { lead_employees_id, service_type_id },
    });
    if (!mapping) throw new Error('Mapping not found');

    // Validate new foreign keys if provided
    if (data.lead_employees_id) {
      const employee = await Employee.findByPk(data.lead_employees_id);
      if (!employee) throw new Error('New employee not found');
    }
    if (data.service_type_id) {
      const serviceType = await ServiceType.findByPk(data.service_type_id);
      if (!serviceType) throw new Error('New service type not found');
    }

    // Use transaction to update or create new mapping
    return await sequelize.transaction(async (t) => {
      if (data.lead_employees_id !== lead_employees_id || data.service_type_id !== service_type_id) {
        // Delete old mapping and create new one
        await mapping.destroy({ transaction: t });
        const newMapping = await TechnicianServiceType.create(
          {
            lead_employees_id: data.lead_employees_id || lead_employees_id,
            service_type_id: data.service_type_id || service_type_id,
          },
          { transaction: t }
        );
        return newMapping;
      }
      return await mapping.update(data, { transaction: t });
    });
  }

  async deleteTechnicianServiceType(lead_employees_id, service_type_id) {
    const mapping = await TechnicianServiceType.findOne({
      where: { lead_employees_id, service_type_id },
    });
    if (!mapping) throw new Error('Mapping not found');
    await mapping.destroy();
    return { message: 'Mapping deleted successfully' };
  }
}

module.exports = new TechnicianServiceTypeService();