'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existingIndexes = await queryInterface.showIndex('service_orders');
    const indexNames = existingIndexes.map(index => index.name);

    // Only create due_date index if it doesn't exist
    if (!indexNames.includes('idx_service_orders_due_date')) {
      await queryInterface.addIndex('service_orders', ['due_date'], {
        name: 'idx_service_orders_due_date',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeIndex('service_orders', 'idx_service_orders_due_date');
    } catch (error) {
      if (error.message.includes('needed in a foreign key constraint')) {
        console.warn('Skipping removal of idx_service_orders_due_date due to foreign key constraint');
      } else {
        throw error;
      }
    }
  },
};