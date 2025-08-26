//npx sequelize-cli db:migrate

import { QueryInterface, QueryTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Use CREATE INDEX IF NOT EXISTS with CONCURRENTLY to avoid locking issues in production
  // But note: PostgreSQL doesn't support IF NOT EXISTS for CREATE INDEX, so we do a check before creating

  // Helper function to create index if not exists (concurrently)
  async function createIndexIfNotExists(
  queryInterface: QueryInterface,
  table: string,
  indexName: string,
  columns: string[],
  ) {
    // Check if index exists
  const indexes = await queryInterface.sequelize.query<{ indexname: string }>(
    `
    SELECT indexname FROM pg_indexes 
    WHERE tablename = :table AND indexname = :indexName
    `,
    {
      type: QueryTypes.SELECT,
      replacements: { table, indexName },
    },
  );

  if (indexes.length === 0) {
    await queryInterface.sequelize.query(
      `CREATE INDEX CONCURRENTLY ${indexName} ON ${table} (${columns.join(', ')});`
    );
  } else {
    console.log(`Index ${indexName} already exists on ${table}`);
  }
  }

  // List of indexes to create:
  await createIndexIfNotExists(queryInterface,'attachments', 'idx_attachments_order_id', ['order_id']);
  await createIndexIfNotExists(queryInterface,'recurring_orders', 'idx_recurring_orders_order_id', ['order_id']);
//  await createIndexIfNotExists(queryInterface,'service_order_items', 'idx_service_order_items_order_id', ['order_id']);
//  await createIndexIfNotExists(queryInterface,'service_order_items', 'idx_service_order_items_service_type_id', ['service_type_id']);
  await createIndexIfNotExists(queryInterface,'employee_service_types', 'idx_employee_service_types_employee_id', ['employee_id']);
  await createIndexIfNotExists(queryInterface,'employee_service_types', 'idx_employee_service_types_service_type_id', ['service_type_id']);
  await createIndexIfNotExists(queryInterface,'service_order_status_history', 'idx_service_order_status_history_order_id', ['order_id']);
  await createIndexIfNotExists(queryInterface,'service_order_status_history', 'idx_service_order_status_history_changed_by', ['changed_by']);
  await createIndexIfNotExists(queryInterface,'service_order_assignments', 'idx_service_order_assignments_order_id', ['order_id']);
  await createIndexIfNotExists(queryInterface,'service_order_assignments', 'idx_service_order_assignments_employee_id', ['employee_id']);
  await createIndexIfNotExists(queryInterface,'service_orders', 'idx_service_orders_due_date', ['due_date']);
  await createIndexIfNotExists(queryInterface,'notifications', 'idx_notifications_service_order_id', ['service_order_id']);
}

export async function down(queryInterface: QueryInterface) {
  // Drop indexes (must NOT use concurrently inside transaction so here just drop normally)
  const dropIndexIfExists = async (table: string, indexName: string) => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_indexes WHERE tablename = '${table}' AND indexname = '${indexName}'
        ) THEN
          EXECUTE 'DROP INDEX CONCURRENTLY IF EXISTS ${indexName}';
        END IF;
      END;
      $$;
    `);
  };

  await dropIndexIfExists('attachments', 'idx_attachments_order_id');
  await dropIndexIfExists('recurring_orders', 'idx_recurring_orders_order_id');
//  await dropIndexIfExists('service_order_items', 'idx_service_order_items_order_id');
//  await dropIndexIfExists('service_order_items', 'idx_service_order_items_service_type_id');
  await dropIndexIfExists('employee_service_types', 'idx_employee_service_types_employee_id');
  await dropIndexIfExists('employee_service_types', 'idx_employee_service_types_service_type_id');
  await dropIndexIfExists('service_order_status_history', 'idx_service_order_status_history_order_id');
  await dropIndexIfExists('service_order_status_history', 'idx_service_order_status_history_changed_by');
  await dropIndexIfExists('service_order_assignments', 'idx_service_order_assignments_order_id');
  await dropIndexIfExists('service_order_assignments', 'idx_service_order_assignments_employee_id');
  await dropIndexIfExists('service_orders', 'idx_service_orders_due_date');
  await dropIndexIfExists('notifications', 'idx_notifications_service_order_id');
}
