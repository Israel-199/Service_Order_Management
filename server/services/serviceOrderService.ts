//import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { db } from "../models/index";
import notificationService from "./notificationService";
import { buildSearchCondition } from "../utils/search";
import { parsePagination } from "../utils/pagination";
import type {ParsedPagination, QueryParams, PaginationResult } from "../utils/pagination";

export interface AssignedEmployee {
  name: string | null;
  email: string | null;
}

export interface ServiceOrderAttachment {
  file_path: string;
  file_type: string;
}

export interface ServiceOrderResponse {
  orderId: number;
  serviceTypeName: string | null;
  customerName: string | null;
  customerEmail: string | null;
  serviceOrderStatus: string;
  serviceOrderPriority: string;
  dueDate: Date | null;
  assignedEmployees: AssignedEmployee[];
  serviceOrderAttachments: ServiceOrderAttachment[];
}


// interface GetAllParams extends ParsedPagination {
//   status?: string;
//   priority?: string;
//   customer_id?: number | string;
//   overdue?: boolean;
//   search?: string;
// }

class ServiceOrderService {
  async getAllServiceOrders(
    query: QueryParams
  ): Promise<PaginationResult<ServiceOrderResponse>> {
    const { page, limit, offset, sortBy, sortOrder } = parsePagination(query);

    const validSortFields = [
      "order_id",
      "status",
      "priority",
      "created_at",
      "due_date",
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new Error(
        `Invalid sortBy field. Valid fields are: ${validSortFields.join(", ")}`
      );
    }

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.customer_id) where.customer_id = query.customer_id;
    if (query.overdue) {
      where.due_date = {
        [Op.lte]: new Date(),
        [Op.ne]: null,
      };
      where.status = { [Op.ne]: "completed" };
    }

    const search = query.search || query.q || "";
    if (search) {
      const searchFields = ["description", "status"];
      const searchCondition = buildSearchCondition(searchFields, search);
      where[Op.and] = searchCondition;
    }

    const { count, rows } = await db.ServiceOrder.findAndCountAll({
      where,
      include: [
        { model: db.ServiceType, attributes: ["name"] },
        { model: db.Customer, attributes: ["name", "email"] },
        {
          model: db.ServiceOrderAssignment,
          include: [{ model: db.Employee, attributes: ["name", "email"] }],
        },
        { model: db.Attachment, attributes: ["file_path", "file_type"] },
      ],
      attributes: [
        "order_id",
        "status",
        "priority",
        "created_at",
        "due_date",
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    if (!rows || rows.length === 0) {
      return {
        items: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    const serviceOrders: ServiceOrderResponse[] = rows.map((order) => ({
      orderId: order.order_id,
      serviceTypeName: order.ServiceType?.name ?? null,
      customerName: order.Customer?.name ?? null,
      customerEmail: order.Customer?.email ?? null,
      serviceOrderStatus: order.status ?? "unknown",
      serviceOrderPriority: order.priority ?? "low",
      dueDate: order.due_date ?? null,
      assignedEmployees:
        order.ServiceOrderAssignments?.map((assignment) => ({
          name: assignment.Employee?.name ?? null,
          email: assignment.Employee?.email ?? null,
        })) ?? [],
      serviceOrderAttachments:
        order.Attachments?.map((attachment) => ({
          file_path: attachment.file_path,
          file_type: attachment.file_type,
        })) ?? [],
    }));

    return {
      items: serviceOrders,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }


  async createServiceOrder(data: {
    customer_id: number;
    service_type_id: number;
    description?: string;
    priority: "low" | "medium" | "high";
    due_date?: Date;
  }) {
    return db.sequelize.transaction(async (t) => {
      const order = await db.ServiceOrder.create(
        {
          customer_id: data.customer_id,
          service_type_id: data.service_type_id,
          description: data.description,
          priority: data.priority,
          status: "new",
          due_date: data.due_date,
          created_at: new Date(),
        },
        { transaction: t }
      );

      // Create notification without recipient ID
      await notificationService.createNotification(
        order.order_id,
        "new_order",
        `New service order created: ${order.order_id}`
      );

      return order;
    });
  }

  async updateServiceOrder(
    id: number,
    data: Partial<{
      customer_id: number;
      service_type_id: number;
      description?: string;
      priority: "low" | "medium" | "high";
      status: "new" | "assigned" | "in_progress" | "completed" | "closed";
      due_date?: Date | null;
      lead_employees_id?: number | null;
      assigned_at?: Date | null;
      started_at?: Date | null;
      completed_at?: Date | null;
      closed_at?: Date | null;
    }>
  ) {
    try {
      const order = await db.ServiceOrder.findByPk(id);
      if (!order) throw new Error("Service Order not found");

      // Convert due_date from null to undefined if necessary:
      const updates: any = {
        ...data,
        updated_at: new Date(),
        due_date: data.due_date === null ? undefined : data.due_date,
      };

      if (data.status === "completed" && order.status !== "completed") {
        updates.completed_at = new Date();
      } else if (data.status === "assigned" && order.status !== "assigned") {
        updates.assigned_at = new Date();
      } else if (data.status === "closed" && order.status !== "closed") {
        updates.closed_at = new Date();
      }

      await order.update(updates);

      if (data.status === "completed" && order.lead_employees_id) {
        await notificationService.createNotification(
          id,
          "completed",
          `Service order ${id} completed`
        );
      }

      return order;
    } catch (error: any) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.parent &&
        error.parent.code === "ER_LOCK_WAIT_TIMEOUT"
      ) {
        throw new Error(
          "Database lock timeout during service order update. Please try again."
        );
      }
      throw error;
    }
  }

  async deleteServiceOrder(id: number) {
    try {
      const order = await db.ServiceOrder.findByPk(id);
      if (!order) throw new Error("Service Order not found");
      await order.destroy();
      return { message: "Service Order deleted successfully" };
    } catch (error: any) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.parent &&
        error.parent.code === "ER_LOCK_WAIT_TIMEOUT"
      ) {
        throw new Error(
          "Database lock timeout during service order deletion. Please try again."
        );
      }
      throw error;
    }
  }

  async getOverdueOrders() {
    try {
      const overdueOrders = await db.ServiceOrder.findAll({
        where: {
          due_date: {
            due_date: {
              [Op.lte]: new Date(),
              [Op.not]: null,
            },
          },
          status: { [Op.ne]: "completed" },
        },
        include: [
          { model: db.Employee, attributes: ["employees_id", "name", "email"] },
        ],
      });

      for (const order of overdueOrders) {
        if (order.lead_employees_id) {
          await notificationService.createNotification(
            order.order_id,
            "overdue",
            `Service order ${order.order_id} is overdue. Due date: ${order.due_date}`
          );
        }
      }

      return overdueOrders;
    } catch (error: any) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.parent &&
        error.parent.code === "ER_LOCK_WAIT_TIMEOUT"
      ) {
        throw new Error(
          "Database lock timeout during overdue orders check. Please try again."
        );
      }
      throw error;
    }
  }
}

export default new ServiceOrderService();
