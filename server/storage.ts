import { eq, sql } from 'drizzle-orm';
import { db } from './db/db';
import {
  customers,
  employees,
  serviceOrders,
  invoices,
  inventoryItems,
  inventoryTransactions,
  type Customer,
  type InsertCustomer,
  type Employee,
  type InsertEmployee,
  type ServiceOrder,
  type InsertServiceOrder,
  type ServiceOrderWithDetails,
  type Invoice,
  type InsertInvoice,
  type InventoryItem,
  type InsertInventoryItem,
  type InventoryTransaction,
  type InsertInventoryTransaction,
} from '@shared/schema';

const now = new Date();

export const storage = {
  // ---------------- Customers ----------------
  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  },
  getCustomers(): Promise<Customer[]> {
    return db.select().from(customers);
  },
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  },
  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated;
  },
  async deleteCustomer(id: number): Promise<boolean> {
    const deleted = await db.delete(customers).where(eq(customers.id, id)).returning();
    return deleted.length > 0;
  },

  // ---------------- Employees ----------------
  async getEmployee(id: number): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.id, id));
    return result[0];
  },
  getEmployees(): Promise<Employee[]> {
    return db.select().from(employees);
  },
  getActiveEmployees(): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.isActive, 1));
  },
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(employee).returning();
    return created;
  },
  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db.update(employees).set(employee).where(eq(employees.id, id)).returning();
    return updated;
  },
  async deleteEmployee(id: number): Promise<boolean> {
    const deleted = await db.delete(employees).where(eq(employees.id, id)).returning();
    return deleted.length > 0;
  },

  // ---------------- Service Orders ----------------
  async getServiceOrder(id: number): Promise<ServiceOrder | undefined> {
    const result = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return result[0];
  },
  async getServiceOrders(): Promise<ServiceOrderWithDetails[]> {
    const orders = await db.select().from(serviceOrders);
    const customerMap = new Map<number, Customer>();
    const employeeMap = new Map<number, Employee>();
    const result: ServiceOrderWithDetails[] = [];

    for (const order of orders) {
      let customer = customerMap.get(order.customerId);
      if (!customer) {
        customer = await this.getCustomer(order.customerId);
        if (customer) customerMap.set(order.customerId, customer);
      }
      let employee: Employee | undefined = undefined;
      if (order.employeeId) {
        employee = employeeMap.get(order.employeeId);
        if (!employee) {
          employee = await this.getEmployee(order.employeeId);
          if (employee) employeeMap.set(order.employeeId, employee);
        }
      }
      result.push({ ...order, customer: customer!, employee });
    }

    return result;
  },
  async getServiceOrdersByCustomer(customerId: number): Promise<ServiceOrderWithDetails[]> {
    return (await this.getServiceOrders()).filter(o => o.customerId === customerId);
  },
  async getServiceOrdersByEmployee(employeeId: number): Promise<ServiceOrderWithDetails[]> {
    return (await this.getServiceOrders()).filter(o => o.employeeId === employeeId);
  },
  async getServiceOrdersByStatus(status: string): Promise<ServiceOrderWithDetails[]> {
    return (await this.getServiceOrders()).filter(o => o.status === status);
  },
  async createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder> {
    const [{ count }] = await db.select({ count: sql<number>`COUNT(*)`.mapWith(Number) }).from(serviceOrders);
    const generateOrderId = (): string => `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
    const orderId = generateOrderId();
    const [created] = await db.insert(serviceOrders).values({ ...order, orderId, createdAt: now, updatedAt: now }).returning();
    return created;
  },
  async updateServiceOrder(id: number, order: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined> {
    const [updated] = await db.update(serviceOrders).set({ ...order, updatedAt: new Date() }).where(eq(serviceOrders.id, id)).returning();
    return updated;
  },
  async deleteServiceOrder(id: number): Promise<boolean> {
    const deleted = await db.delete(serviceOrders).where(eq(serviceOrders.id, id)).returning();
    return deleted.length > 0;
  },

  // ---------------- Invoices ----------------
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  },
  getInvoices(): Promise<Invoice[]> {
    return db.select().from(invoices);
  },
  getInvoicesByServiceOrder(serviceOrderId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.serviceOrderId, serviceOrderId));
  },
  async createInvoice(input: InsertInvoice): Promise<Invoice> {
    const [{ count }] = await db.select({ count: sql<number>`COUNT(*)`.mapWith(Number) }).from(invoices);
    const generateInvoiceNumber = (): string => `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const [created] = await db.insert(invoices).values({ ...input, invoiceNumber: generateInvoiceNumber(), createdAt: now, updatedAt: now }).returning();
    return created;
  },
  async updateInvoice(id: number, input: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices).set({ ...input, updatedAt: now }).where(eq(invoices.id, id)).returning();
    return updated;
  },
  async deleteInvoice(id: number): Promise<boolean> {
    const deleted = await db.delete(invoices).where(eq(invoices.id, id)).returning();
    return deleted.length > 0;
  },

    async getCustomerOrderHistory(customerId: number): Promise<ServiceOrderWithDetails[]> {
    const orders = await this.getServiceOrdersByCustomer(customerId);
    return orders.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  },

  async getDashboardStats() {
    const orders = await db.select().from(serviceOrders);
    const employees = await this.getActiveEmployees();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = orders.filter(o => {
      return o.status === 'completed' && o.updatedAt && new Date(o.updatedAt).setHours(0, 0, 0, 0) === today.getTime();
    }).length;

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders: orders.length,
      inProgress: statusCounts['in_progress'] || 0,
      completedToday,
      activeEmployees: employees.length,
      statusCounts,
    };
  },
// ---------------- Inventory ----------------
async getInventoryItems(): Promise<InventoryItem[]> {
  return db.select().from(inventoryItems);
},

async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
  const result = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
  return result[0];
},

async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
  const [created] = await db.insert(inventoryItems).values(item).returning();
  return created;
},

async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
  const [updated] = await db.update(inventoryItems).set(item).where(eq(inventoryItems.id, id)).returning();
  return updated;
},

async deleteInventoryItem(id: number): Promise<boolean> {
  const deleted = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning();
  return deleted.length > 0;
},

async getInventoryTransactions(): Promise<InventoryTransaction[]> {
  return db.select().from(inventoryTransactions);
},

async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
  const now = new Date();

  // 1. Insert the transaction
  const [created] = await db.insert(inventoryTransactions)
    .values({ ...transaction, createdAt: now })
    .returning();

  // 2. Fetch the corresponding inventory item
  const item = await this.getInventoryItem(transaction.itemId);
  if (!item) throw new Error("Inventory item not found");

  // 3. Update quantity based on transaction type
  let newQuantity = item.quantity;
  switch (transaction.type) {
    case "IN":
      newQuantity += transaction.quantity;
      break;
    case "OUT":
      newQuantity -= transaction.quantity;
      if (newQuantity < 0) newQuantity = 0; // prevent negative stock
      break;
    case "ADJUST":
      newQuantity = transaction.quantity; // direct adjustment
      break;
    default:
      throw new Error("Invalid transaction type");
  }

  // 4. Update the inventory item with the new quantity
  await db.update(inventoryItems)
    .set({ quantity: newQuantity, updatedAt: now })
    .where(eq(inventoryItems.id, transaction.itemId));

  return created;
}
}
