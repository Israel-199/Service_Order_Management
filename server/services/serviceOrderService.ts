// services/serviceOrderService.ts
import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import { db } from "../models/index";
import notificationService from "./notificationService";
import { buildSearchCondition } from "../utils/search";
import { parsePagination } from "../utils/pagination";
import type { QueryParams, PaginationResult } from "../utils/pagination";
import { Attachment } from "../models/attachment";

type Priority = "low" | "medium" | "high";
type Frequency = "daily" | "weekly" | "monthly";
type Status = "new" | "assigned" | "in_progress" | "completed" | "closed";

export interface AssignedEmployee {
  id: number;
  name: string | null;
}

export interface ServiceOrderAttachment {
  attachment_id?: number;
  file_path: string;
  original_name: string;
  file_type?: "image" | "document" | "audio";
}

interface CreateServiceOrderInput {
  customer_id: number;
  service_type_id: number;
  description?: string;
  priority: Priority;
  due_date?: Date;
  status?: Status;
  assignments?: number[];
  attachments?: ServiceOrderAttachment[];
  recurring?: {
    frequency: Frequency;
    next_due_date?: Date;
    end_date: Date;
  };
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

const { ServiceOrder, ServiceOrderAssignment, RecurringOrder, sequelize } = db;

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
      where.due_date = { [Op.lte]: new Date(), [Op.ne]: null };
      where.status = { [Op.ne]: "completed" };
    }

    const search = query.search || query.q || "";
    if (search) {
      const searchFields = ["description", "status"];
      const searchCondition = buildSearchCondition(searchFields, search);
      where[Op.and] = searchCondition;
    }

    const { count, rows } = await ServiceOrder.findAndCountAll({
      where,
      include: [
        { model: db.ServiceType, attributes: ["name"] },
        { model: db.Customer, attributes: ["name", "email"] },
        {
          model: db.ServiceOrderAssignment,
          include: [
            {
              model: db.Employee,
              attributes: ["employee_id", "name", "email"],
            },
          ],
        },
        {
          model: Attachment,
          attributes: [
            "attachment_id",
            "original_name",
            "file_path",
            "file_type",
          ],
        },
      ],
      attributes: ["order_id", "status", "priority", "created_at", "due_date"],
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    const serviceOrders: ServiceOrderResponse[] = (rows || []).map((order) => ({
      orderId: order.order_id,
      serviceTypeName: order.ServiceType?.name ?? null,
      customerName: order.Customer?.name ?? null,
      customerEmail: order.Customer?.email ?? null,
      serviceOrderStatus: order.status ?? "unknown",
      serviceOrderPriority: order.priority ?? "low",
      dueDate: order.due_date ?? null,
      assignedEmployees:
        order.ServiceOrderAssignments?.map((a) => {
          const emp = a.Employee as {
            employee_id: number;
            name?: string | null;
          };
          return { id: emp.employee_id, name: emp.name ?? null };
        }) ?? [],
      serviceOrderAttachments:
        (order.Attachments as Attachment[] | undefined)?.map((att) => ({
          attachment_id: att.attachment_id,
          original_name: att.original_name,
          file_type: att.file_type ?? "document",
          file_path: att.file_path,
          download_url: `http://localhost:3000/api/service-orders/attachments/${att.attachment_id}/download`,
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

  async createServiceOrder(data: CreateServiceOrderInput) {
    const t = await sequelize.transaction();
    try {
      const order = await ServiceOrder.create(
        {
          customer_id: data.customer_id,
          service_type_id: data.service_type_id,
          description: data.description,
          priority: data.priority,
          status: data.status ?? "new",
          due_date: data.due_date,
          created_at: new Date(),
        },
        { transaction: t }
      );

      if (data.recurring) {
        await RecurringOrder.create(
          {
            order_id: order.order_id,
            frequency: data.recurring.frequency,
            next_due_date: data.recurring.next_due_date ?? undefined,
            end_date: data.recurring.end_date,
            created_at: new Date(),
          },
          { transaction: t }
        );
      }

      if (data.assignments && data.assignments.length > 0) {
        const assignments = data.assignments.map((empId) => ({
          order_id: order.order_id,
          employee_id: empId,
          assigned_at: new Date(),
        }));
        await ServiceOrderAssignment.bulkCreate(assignments, {
          transaction: t,
        });
      }

      if (data.attachments && data.attachments.length > 0) {
        const atts = data.attachments.map((a) => ({
          order_id: order.order_id,
          file_path: a.file_path,
          original_name: a.original_name,
          file_type: a.file_type,
          created_at: new Date(),
        }));
        await Attachment.bulkCreate(atts, { transaction: t });
      }

      await t.commit();

      try {
        await notificationService.createNotification(
          order.order_id,
          "new_order",
          `New service order created: ${order.order_id}`
        );
      } catch (nErr) {
        console.error("Notification creation failed:", nErr);
      }

      return order;
    } catch (err: any) {
      await t.rollback();
      console.error("CreateServiceOrder error:", err.errors || err);
      throw err;
    }
  }

  async updateServiceOrder(id: number, data: Partial<CreateServiceOrderInput>) {
    const t = await sequelize.transaction();
    const oldAttachmentPaths: string[] = [];

    try {
      const order = await ServiceOrder.findByPk(id, { transaction: t });
      if (!order) throw new Error("Service Order not found");

      await order.update(
        {
          customer_id: data.customer_id ?? order.customer_id,
          service_type_id: data.service_type_id ?? order.service_type_id,
          description: data.description ?? order.description,
          priority: data.priority ?? order.priority,
          status: data.status ?? order.status,
          due_date: data.due_date ?? order.due_date,
          updated_at: new Date(),
        },
        { transaction: t }
      );

      if (data.recurring) {
        const existing = await RecurringOrder.findOne({
          where: { order_id: id },
          transaction: t,
        });
        if (existing) {
          await existing.update(
            {
              frequency: data.recurring.frequency ?? existing.frequency,
              next_due_date:
                data.recurring.next_due_date ?? existing.next_due_date,
              end_date: data.recurring.end_date ?? existing.end_date,
            },
            { transaction: t }
          );
        } else {
          await RecurringOrder.create(
            {
              order_id: id,
              frequency: data.recurring.frequency,
              next_due_date: data.recurring.next_due_date ?? undefined,
              end_date: data.recurring.end_date,
              created_at: new Date(),
            },
            { transaction: t }
          );
        }
      }

      if (data.assignments) {
        await ServiceOrderAssignment.destroy({
          where: { order_id: id },
          transaction: t,
        });
        if (data.assignments.length > 0) {
          const newAssignments = data.assignments.map((empId) => ({
            order_id: id,
            employee_id: empId,
            assigned_at: new Date(),
          }));
          await ServiceOrderAssignment.bulkCreate(newAssignments, {
            transaction: t,
          });
        }
      }

      if (data.attachments) {
        const oldAtts = await Attachment.findAll({
          where: { order_id: id },
          transaction: t,
        });
        for (const a of oldAtts) {
          if (a.file_path) oldAttachmentPaths.push(a.file_path);
        }

        await Attachment.destroy({ where: { order_id: id }, transaction: t });

        if (data.attachments.length > 0) {
          const newAtts = data.attachments.map((att) => ({
            order_id: id,
            file_path: att.file_path,
            original_name: att.original_name,
            file_type: att.file_type,
            created_at: new Date(),
          }));
          await Attachment.bulkCreate(newAtts, { transaction: t });
        }
      }

      await t.commit();

      for (const relPath of oldAttachmentPaths) {
        try {
          const abs = path.resolve(process.cwd(), relPath);
          if (fs.existsSync(abs)) fs.unlinkSync(abs);
        } catch (fsErr) {
          console.error(
            "Failed to delete old attachment file:",
            relPath,
            fsErr
          );
        }
      }

      if (data.status === "completed") {
        try {
          await notificationService.createNotification(
            id,
            "completed",
            `Service order ${id} completed`
          );
        } catch (nErr) {
          console.error("Notification creation failed:", nErr);
        }
      }

      return order;
    } catch (err: any) {
      await t.rollback();
      console.error("UpdateServiceOrder error:", err.errors || err);
      throw err;
    }
  }

  async deleteServiceOrder(id: number) {
    const t = await sequelize.transaction();
    const oldAttachmentPaths: string[] = [];
    try {
      const order = await ServiceOrder.findByPk(id, { transaction: t });
      if (!order) throw new Error("Service Order not found");

      const atts = await Attachment.findAll({
        where: { order_id: id },
        transaction: t,
      });
      for (const a of atts)
        if (a.file_path) oldAttachmentPaths.push(a.file_path);

      await Attachment.destroy({ where: { order_id: id }, transaction: t });
      await ServiceOrderAssignment.destroy({
        where: { order_id: id },
        transaction: t,
      });
      await order.destroy({ transaction: t });

      await t.commit();

      for (const relPath of oldAttachmentPaths) {
        try {
          const abs = path.resolve(process.cwd(), relPath);
          if (fs.existsSync(abs)) fs.unlinkSync(abs);
        } catch (fsErr) {
          console.error(
            "Failed to delete file after service order deletion:",
            relPath,
            fsErr
          );
        }
      }

      return { message: "Service Order deleted successfully" };
    } catch (err: any) {
      await t.rollback();
      console.error("DeleteServiceOrder error:", err.errors || err);
      throw err;
    }
  }

  async getServiceOrderById(orderId: number) {
    const order = await db.ServiceOrder.findOne({
      where: { order_id: orderId },
      include: [
        { model: db.ServiceType, attributes: ["name"] },
        { model: db.Customer, attributes: ["name", "email"] },
        {
          model: ServiceOrderAssignment,
          include: [
            {
              model: db.Employee,
              attributes: ["employee_id", "name", "email"],
            },
          ],
        },
        {
          model: Attachment,
          attributes: [
            "attachment_id",
            "original_name",
            "file_path",
            "file_type",
          ],
        },
      ],
    });

    if (!order) return null;

    return {
      orderId: order.order_id,
      serviceTypeName: order.ServiceType?.name ?? null,
      customerName: order.Customer?.name ?? null,
      customerEmail: order.Customer?.email ?? null,
      serviceOrderStatus: order.status ?? "unknown",
      serviceOrderPriority: order.priority ?? "low",
      dueDate: order.due_date ?? null,
      assignedEmployees:
        order.ServiceOrderAssignments?.map((a) => {
          const emp = a.Employee as {
            employee_id: number;
            name?: string | null;
          };
          return { id: emp.employee_id, name: emp.name ?? null };
        }) ?? [],
      serviceOrderAttachments:
        (order.Attachments as Attachment[] | undefined)?.map((att) => ({
          attachment_id: att.attachment_id,
          original_name: att.original_name,
          file_type: att.file_type ?? "document",
          file_path: att.file_path,
          download_url: `http://localhost:3000/api/service-orders/attachments/${att.attachment_id}/download`,
        })) ?? [],
    };
  }

  async getOverdueOrders() {
    const overdue = await ServiceOrder.findAll({
      where: {
        due_date: { [Op.lte]: new Date() },
        status: { [Op.ne]: "completed" },
      },
      include: [
        { model: db.Employee, attributes: ["employee_id", "name", "email"] },
      ],
    });

    for (const order of overdue) {
      if (order.employee_id) {
        try {
          await notificationService.createNotification(
            order.order_id,
            "overdue",
            `Service order ${order.order_id} is overdue. Due: ${order.due_date}`
          );
        } catch (nErr) {
          console.error("Failed to create overdue notification:", nErr);
        }
      }
    }
    return overdue;
  }
}

export default new ServiceOrderService();
