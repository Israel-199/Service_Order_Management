'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if indexes exist before adding to avoid duplicates
    const existingIndexes = await queryInterface.showIndex('notifications');
    const indexNames = existingIndexes.map(index => index.name);

    if (!indexNames.includes('idx_notifications_employee_id')) {
      await queryInterface.addIndex('notifications', ['employee_id'], {
        name: 'idx_notifications_employee_id',
      });
    }
    if (!indexNames.includes('idx_notifications_service_order_id')) {
      await queryInterface.addIndex('notifications', ['service_order_id'], {
        name: 'idx_notifications_service_order_id',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Skip dropping indexes if required by foreign keys
    try {
      await queryInterface.removeIndex('notifications', 'idx_notifications_employee_id');
    } catch (error) {
      if (error.message.includes('needed in a foreign key constraint')) {
        console.warn('Skipping removal of idx_notifications_employee_id due to foreign key constraint');
      } else {
        throw error;
      }
    }
    try {
      await queryInterface.removeIndex('notifications', 'idx_notifications_service_order_id');
    } catch (error) {
      if (error.message.includes('needed in a foreign key constraint')) {
        console.warn('Skipping removal of idx_notifications_service_order_id due to foreign key constraint');
      } else {
        throw error;
      }
    }
  },
};