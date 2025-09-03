ALTER TABLE "invoices"
ALTER COLUMN "service_order_id" TYPE text USING "service_order_id"::text;