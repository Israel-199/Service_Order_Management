'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existingIndexes = await queryInterface.showIndex('service_order_assignments');
    const indexNames = existingIndexes.map(index => index.name);

    if (!indexNames.includes('idx_service_order_assignments_order_id')) {
      await queryInterface.addIndex('service_order_assignments', ['order_id'], {
        name: 'idx_service_order_assignments_order_id',
      });
    }
    if (!indexNames.includes('idx_service_order_assignments_employees_id')) {
      await queryInterface.addIndex('service_order_assignments', ['employees_id'], {
        name: 'idx_service_order_assignments_employees_id',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeIndex('service_order_assignments', 'idx_service_order_assignments_order_id');
    } catch (error) {
      if (error.message.includes('needed in a foreign key constraint')) {
        console.warn('Skipping removal of idx_service_order_assignments_order_id due to foreign key constraint');
      } else {
        throw error;
      }
    }
    try {
      await queryInterface.removeIndex('service_order_assignments', 'idx_service_order_assignments_employees_id');
    } catch (error) {
      if (error.message.includes('needed in a foreign key constraint')) {
        console.warn('Skipping removal of idx_service_order_assignments_employees_id due to foreign key constraint');
      } else {
        throw error;
      }
    }
  },
};