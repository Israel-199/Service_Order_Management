import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  company: text("company"),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  specialties: text("specialties").array(),
  isActive: integer("is_active").default(1),
});

export const serviceOrders = pgTable("service_orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  employeeId: integer("employee_id"),
  serviceType: text("service_type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("new"),
  priority: text("priority").notNull().default("normal"),
  attachments: json("attachments").$type<{name: string; type: string; url: string}[]>().default([]),
  isRecurring: integer("is_recurring").default(0),
  recurringFrequency: text("recurring_frequency"), // daily, weekly, monthly, custom
  recurringEndDate: timestamp("recurring_end_date"),
  customFrequencyValue: integer("custom_frequency_value"),
  customFrequencyUnit: text("custom_frequency_unit"),
  nextScheduledDate: timestamp("next_scheduled_date"),
  parentOrderId: integer("parent_order_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  isActive: true,
});

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
    url: z.string()
  })).optional(),
  isRecurring: z.number().optional(),
  recurringFrequency: z.enum(["daily", "weekly", "monthly", "custom"]).optional(),
  customFrequencyValue: z.number().optional(),
  customFrequencyUnit: z.enum(["days", "weeks", "months"]).optional(),
  recurringEndDate: z.date().optional(),
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;

// Extended types for joined data
export type ServiceOrderWithDetails = ServiceOrder & {
  customer: Customer;
  employee?: Employee;
};
