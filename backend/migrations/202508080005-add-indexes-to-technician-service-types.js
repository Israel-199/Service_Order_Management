'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('technician_service_types', ['lead_employees_id'], {
      name: 'idx_technician_service_types_lead_employees_id',
    });
    await queryInterface.addIndex('technician_service_types', ['service_type_id'], {
      name: 'idx_technician_service_types_service_type_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('technician_service_types', 'idx_technician_service_types_lead_employees_id');
    await queryInterface.removeIndex('technician_service_types', 'idx_technician_service_types_service_type_id');
  },
};