import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ---------------------
// 1. TABLE DEFINITIONS
// ---------------------

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  company: text("company"),
});

// Employees
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  specialties: text("specialties").array(),
  isActive: integer("is_active").default(1),
});

// Service Orders
export const serviceOrders = pgTable("service_orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  employeeId: integer("employee_id"),
  serviceType: text("service_type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("new"),
  priority: text("priority").notNull().default("normal"),
  attachments: json("attachments").$type<{ name: string; type: string; url: string }[]>().default([]),
  isRecurring: integer("is_recurring").default(0),
  recurringFrequency: text("recurring_frequency"),
  recurringEndDate: timestamp("recurring_end_date"),
  customFrequencyValue: integer("custom_frequency_value"),
  customFrequencyUnit: text("custom_frequency_unit"),
  nextScheduledDate: timestamp("next_scheduled_date"),
  parentOrderId: integer("parent_order_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  serviceOrderId: text("service_order_id").notNull(),
  items: json("items").$type<Array<{ description: string; quantity: number; unitPriceCents: number }>>().default([]),
  subtotalCents: integer("subtotal_cents").notNull().default(0),
  taxCents: integer("tax_cents").notNull().default(0),
  discountCents: integer("discount_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull().default(0),
  currency: text("currency").notNull().default("ETB"),
  status: text("status").notNull().default("draft"), // draft, sent, paid, void
  notes: text("notes"),
  issuedAt: timestamp("issued_at").defaultNow(),
  dueAt: timestamp("due_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory Items
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(), // Stock Keeping Unit
  description: text("description"),
  category: text("category"),
  quantity: integer("quantity").notNull().default(0),
  unitPriceCents: integer("unit_price_cents").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory Transactions
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => inventoryItems.id),
  type: text("type").notNull(), // IN, OUT, ADJUST
  quantity: integer("quantity").notNull(),
  reference: text("reference"), // e.g. service order, invoice
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---------------------
// 2. INSERT / UPDATE SCHEMAS (Zod)
// ---------------------

// Customers
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
});

// Employees
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  isActive: true,
});

// Service Orders
export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({
  id: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,
  parentOrderId: true,
  nextScheduledDate: true,
}).extend({
  customerId: z.number().min(1, "Customer is required"),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["new", "assigned", "in_progress", "completed", "closed"]).default("new"),
  priority: z.enum(["normal", "urgent", "high"]).default("normal"),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    url: z.string(),
  })).optional(),
  isRecurring: z.number().optional(),
  recurringFrequency: z.enum(["daily", "weekly", "monthly", "custom"]).optional(),
  customFrequencyValue: z.number().optional(),
  customFrequencyUnit: z.enum(["days", "weeks", "months"]).optional(),
  recurringEndDate: z.preprocess(
    (val) => {
      if (typeof val === "string" || typeof val === "number") {
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      }
      return val;
    },
    z.date()
  ).optional(),
});

export const updateServiceOrderSchema = z.object({
  customerId: z.number().min(1).optional(),
  employeeId: z.number().nullable().optional(),
  serviceType: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["new", "assigned", "in_progress", "completed", "closed"]).optional(),
  priority: z.enum(["normal", "urgent", "high"]).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    url: z.string(),
  })).optional(),
  isRecurring: z.number().optional(),
  recurringFrequency: z.enum(["daily", "weekly", "monthly", "custom"]).optional(),
  customFrequencyValue: z.number().optional(),
  customFrequencyUnit: z.enum(["days", "weeks", "months"]).optional(),
  recurringEndDate: z.preprocess(
    (val) => {
      if (typeof val === "string" || typeof val === "number") {
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      }
      return val;
    },
    z.date()
  ).optional(),
}).strict();

// Invoices
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceNumber: true,
  subtotalCents: true,
  totalCents: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  serviceOrderId: z.string().min(1, "Service order is required"),
  currency: z.string().min(1).default("ETB"),
  status: z.enum(["draft", "sent", "paid", "void"]).default("draft"),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPriceCents: z.number().int().nonnegative(),
  })).default([]),
  taxCents: z.number().int().nonnegative().default(0),
  discountCents: z.number().int().nonnegative().default(0),
  issuedAt: z.preprocess((val) => {
    if (typeof val === "string" || typeof val === "number") {
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    return val;
  }, z.date().optional()).optional(),
  dueAt: z.preprocess((val) => {
    if (typeof val === "string" || typeof val === "number") {
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    return val;
  }, z.date().optional()).optional(),
});

// Inventory
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

// ---------------------
// 3. TYPES
// ---------------------

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type UpdateServiceOrder = z.infer<typeof updateServiceOrderSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;

// Extended type for joined data
export type ServiceOrderWithDetails = ServiceOrder & {
  customer: Customer;
  employee?: Employee;
};
