import { eq, and, sql } from 'drizzle-orm';
import { db } from './db/db';
import {
  customers,
  employees,
  serviceOrders,
  invoices,
  type Customer,
  type InsertCustomer,
  type Employee,
  type InsertEmployee,
  type ServiceOrder,
  type InsertServiceOrder,
  type ServiceOrderWithDetails,
  type Invoice,
  type InsertInvoice,
} from '@shared/schema';
const now = new Date();

// const generateOrderId(): string {
//     const year = new Date().getFullYear();
//     const orderNumber = String(currentServiceOrderId).padStart(3, '0');
//     return `ORD-${year}-${orderNumber}`;
//   }

export const storage = {
  
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
  const now = new Date();

  // Query the count of existing service orders to generate a new unique number
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(serviceOrders);

  const generateOrderId = (): string => {
    const year = new Date().getFullYear();
    const orderNumber = String(count + 1).padStart(3, "0");
    return `ORD-${year}-${orderNumber}`;
  };

  const orderId = generateOrderId();

  const [created] = await db
    .insert(serviceOrders)
    .values({
      ...order,
      orderId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
},


  async updateServiceOrder(id: number, order: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined> {
    const [updated] = await db.update(serviceOrders).set({
      ...order,
      updatedAt: new Date(), // always update here
    }).where(eq(serviceOrders.id, id)).returning();
    return updated;
  },

  async deleteServiceOrder(id: number): Promise<boolean> {
    const deleted = await db.delete(serviceOrders).where(eq(serviceOrders.id, id)).returning();
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

  // ===== Invoices =====
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
    // Generate invoice number
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(invoices);

    const generateInvoiceNumber = (): string => {
      const year = new Date().getFullYear();
      const invoiceNumber = String(count + 1).padStart(3, '0');
      return `INV-${year}-${invoiceNumber}`;
    };

    // Normalize serviceOrderId to our canonical format "#ORD-YYYY-XXX"
    let normalizedServiceOrderId = String(input.serviceOrderId ?? '').trim();
    if (!normalizedServiceOrderId) {
      throw new Error('serviceOrderId is required');
    }
    // If it's purely numeric, assume it's the service order numeric id and look up the orderId
    if (/^\d+$/.test(normalizedServiceOrderId)) {
      const serviceOrder = await this.getServiceOrder(Number(normalizedServiceOrderId));
      if (!serviceOrder?.orderId) {
        throw new Error('Invalid service order reference');
      }
      normalizedServiceOrderId = `${serviceOrder.orderId}`;
    }
    // If it matches ORD-YYYY-XXX without a leading '#', add it
    if (!normalizedServiceOrderId.startsWith('#') && /^ORD-\d{4}-\d+$/.test(normalizedServiceOrderId)) {
      normalizedServiceOrderId = `#${normalizedServiceOrderId}`;
    }

    const subtotalCents = (input.items ?? []).reduce((acc, item) => acc + (item.quantity * item.unitPriceCents), 0);
    const discountCents = input.discountCents ?? 0;
    const currency = input.currency ?? 'ETB';
    const taxableBase = Math.max(0, subtotalCents - discountCents);
    const taxCents = currency === 'ETB' ? Math.round(taxableBase * 0.15) : (input.taxCents ?? 0);
    const totalCents = subtotalCents + taxCents - discountCents;

    const [created] = await db.insert(invoices).values({
      ...input,
      serviceOrderId: normalizedServiceOrderId,
      invoiceNumber: generateInvoiceNumber(),
      subtotalCents,
      taxCents,
      totalCents,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return created;
  },

  async updateInvoice(id: number, input: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    // If items/tax/discount changed, recompute totals
    let recomputed: Partial<Invoice> = {};
    if (input.items || typeof input.taxCents !== 'undefined' || typeof input.discountCents !== 'undefined' || typeof input.currency !== 'undefined') {
      const existing = await this.getInvoice(id);
      if (!existing) return undefined;
      const items = input.items ?? existing.items ?? [];
      const discountCents = typeof input.discountCents !== 'undefined' ? input.discountCents : (existing.discountCents ?? 0);
      const subtotalCents = items.reduce((acc, item) => acc + (item.quantity * item.unitPriceCents), 0);
      const currency = input.currency ?? existing.currency ?? 'ETB';
      let taxCents = typeof input.taxCents !== 'undefined' ? input.taxCents : (existing.taxCents ?? 0);
      if (currency === 'ETB') {
        const taxableBase = Math.max(0, subtotalCents - discountCents);
        taxCents = Math.round(taxableBase * 0.15);
      }
      const totalCents = subtotalCents + taxCents - discountCents;
      recomputed = { subtotalCents, taxCents, totalCents } as Partial<Invoice>;
    }

    const [updated] = await db.update(invoices).set({
      ...input,
      ...recomputed,
      updatedAt: new Date(),
    }).where(eq(invoices.id, id)).returning();

    return updated;
  },

  async deleteInvoice(id: number): Promise<boolean> {
    const deleted = await db.delete(invoices).where(eq(invoices.id, id)).returning();
    return deleted.length > 0;
  },
};
