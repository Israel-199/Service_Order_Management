import { db } from "../models/index";
import { parsePagination, QueryParams, PaginationResult } from "../utils/pagination";
import { buildSearchCondition } from "../utils/search";
import { Op, WhereOptions } from "sequelize";
import type { CustomerAttributes, CustomerCreationAttributes } from "../models/customer";

interface FormattedCustomer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  tinNumber?: string;
  createdAt?: Date;
  serviceOrders: {
    orderId: number;
    serviceType?: string | null;
    status: string;
    createdAt?: Date;
  }[];
}

function formatCustomer(customer: CustomerAttributes & { ServiceOrders?: any[] }): FormattedCustomer {
  return {
    id: customer.customer_id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company: customer.company,
    address: customer.address,
    tinNumber: customer.tin_number,
    createdAt: customer.created_at,
    serviceOrders:
      customer.ServiceOrders?.map((order) => ({
        orderId: order.orderId ?? order.order_id,
        serviceType: order.ServiceType?.name || null,
        status: order.status,
        createdAt: order.created_at,
      })) || [],
  };
}

class CustomerService {
  async getAllCustomers(query: QueryParams): Promise<PaginationResult<FormattedCustomer>> {
    const { limit, offset, sortBy = "customer_id", sortOrder = "ASC", page } = parsePagination(query);
    const search = query.search || query.q || null;
    const whereClause: WhereOptions = search
      ? buildSearchCondition(["name", "email", "company", "phone"], search)
      : {};

    const { rows: customers, count: total } = await db.Customer.findAndCountAll({
      where: whereClause,
      attributes: [["customer_id", "id"], "name", "email", "phone", "company", "created_at"],
      include: [
        {
          model: db.ServiceOrder,
          attributes: [["order_id", "orderId"], "status", "created_at"],
          include: [{ model: db.ServiceType, attributes: ["name"] }],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      items: customers.map(formatCustomer),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCustomerById(id: number): Promise<FormattedCustomer | null> {
    const customer = await db.Customer.findByPk(id, {
      attributes: [["customer_id", "id"], "name", "email", "phone", "address", "tin_number", "created_at"],
      include: [
        {
          model: db.ServiceOrder,
          attributes: [["order_id", "orderId"], "status", "created_at"],
          include: [{ model: db.ServiceType, attributes: ["name"] }],
        },
      ],
    });
    return customer ? formatCustomer(customer) : null;
  }

  async createCustomer(data: CustomerCreationAttributes): Promise<FormattedCustomer> {
    if (!data.name) {
      throw new Error("Customer name is required");
    }
    
    const customer = await db.Customer.create(data);
    return formatCustomer(customer);
  }

  async updateCustomer(
    id: number,
    data: Partial<Omit<CustomerAttributes, "customer_id">>
  ): Promise<FormattedCustomer> {
    const customer = await db.Customer.findByPk(id);
    if (!customer) throw new Error("Customer not found");
    await customer.update(data);
    return formatCustomer(customer);
  }

  async deleteCustomer(id: number): Promise<{ message: string }> {
    const customer = await db.Customer.findByPk(id);
    if (!customer) throw new Error("Customer not found");
    await customer.destroy();
    return { message: "Customer deleted successfully" };
  }

  async getCustomersByName(name: string, query: QueryParams) {
    return this.#getCustomersByField("name", name, query);
  }

  async getCustomersByEmail(email: string, query: QueryParams) {
    return this.#getCustomersByField("email", email, query);
  }

  async getCustomersByPhone(phone: string, query: QueryParams) {
    return this.#getCustomersByField("phone", phone, query);
  }

  async getCustomersByCompany(company: string, query: QueryParams) {
    return this.#getCustomersByField("company", company, query);
  }

  async getCustomersByAddress(address: string, query: QueryParams) {
    return this.#getCustomersByField("address", address, query);
  }

  async #getCustomersByField(
    field: string,
    value: string,
    query: QueryParams
  ): Promise<PaginationResult<FormattedCustomer>> {
    const { limit, offset, sortBy = "customer_id", sortOrder = "ASC", page } = parsePagination(query);
    const whereClause: WhereOptions = { [field]: { [Op.like]: `%${value}%` } };

    const { rows: customers, count: total } = await db.Customer.findAndCountAll({
      where: whereClause,
      attributes: [["customer_id", "id"], "name", "email", "phone", "company", "address", "tin_number", "created_at"],
      include: [
        {
          model: db.ServiceOrder,
          attributes: [["order_id", "orderId"], "status", "created_at"],
          include: [{ model: db.ServiceType, attributes: ["name"] }],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      items: customers.map(formatCustomer),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new CustomerService();