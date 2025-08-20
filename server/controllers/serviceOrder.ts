// controllers/serviceOrderController.ts
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import serviceOrderService from "../services/serviceOrderService";
import { db } from "../models/index";
import type { PaginationResult, QueryParams } from "../utils/pagination";
import { toDbFilePath } from "../middleware/upload";

/**
 * DTO shape expected from client for creating a service order (multipart/form-data or JSON)
 * Note: attachments may come from client JSON or from multer files; each attachment should include original_name
 * when created from an upload so DB `original_name` is set.
 */
interface CreateServiceOrderDTO {
  customer_id: number;
  service_type_id: number;
  description?: string;
  priority: "low" | "medium" | "high";
  due_date?: string;
  status?: "new" | "assigned" | "in_progress" | "completed" | "closed";
  assignments?: number[];
  // attachments provided by client JSON (or merged with uploaded files). original_name optional if the path already contains the name.
  attachments?: {
    id?: number;
    file_path: string;
    file_type: "image" | "document" | "audio";
    original_name?: string;
  }[];
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    next_due_date?: string;
    end_date: string;
  };
}

function classifyFileType(mimetype: string): "image" | "document" | "audio" {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "audio";
  return "document";
}

class ServiceOrderController {
  async getAllServiceOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as QueryParams;
      const result: PaginationResult<any> =
        await serviceOrderService.getAllServiceOrders(query);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getServiceOrderById(req: Request, res: Response, next: NextFunction) {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId))
      return res.status(400).json({ error: "Invalid order id" });

    try {
      const order = await serviceOrderService.getServiceOrderById(orderId);
      if (!order)
        return res.status(404).json({ error: "Service order not found" });
      return res.status(200).json(order);
    } catch (err) {
      next(err);
    }
  }

  async createServiceOrder(req: Request, res: Response, next: NextFunction) {
    const files = (req.files as Express.Multer.File[]) || [];
    const fileAttachments = files.map((f) => ({
      original_name: f.originalname,
      file_path: toDbFilePath(f),
      file_type: classifyFileType(f.mimetype),
    }));

    const attachments = [
      ...((req.body as any).attachments || []),
      ...fileAttachments,
    ];

    try {
      const body = req.body as unknown as CreateServiceOrderDTO;

      if (!body.customer_id || !body.service_type_id || !body.priority) {
        throw new Error(
          "Missing required fields: customer_id, service_type_id, or priority"
        );
      }

      const orderData = {
        customer_id: Number(body.customer_id),
        service_type_id: Number(body.service_type_id),
        description: body.description,
        priority: body.priority,
        due_date: body.due_date ? new Date(body.due_date) : undefined,
        status: body.status ?? "new",
        assignments: body.assignments?.map(Number),
        attachments,
        recurring: body.recurring
          ? {
              frequency: body.recurring.frequency,
              next_due_date: body.recurring.next_due_date
                ? new Date(body.recurring.next_due_date)
                : undefined,
              end_date: new Date(body.recurring.end_date),
            }
          : undefined,
      };

      const order = await serviceOrderService.createServiceOrder(orderData);
      return res
        .status(201)
        .json({ message: "Service order created", order_id: order.order_id });
    } catch (err) {
      for (const f of files) {
        try {
          const absPath = path.resolve(process.cwd(), toDbFilePath(f));
          if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
        } catch {}
      }
      next(err);
    }
  }

  async updateServiceOrder(req: Request, res: Response, next: NextFunction) {
    const files = (req.files as Express.Multer.File[]) || [];
    const fileAttachments = files.map((f) => ({
      original_name: f.originalname,
      file_path: toDbFilePath(f),
      file_type: classifyFileType(f.mimetype),
    }));

    const attachments = [
      ...((req.body as any).attachments || []),
      ...fileAttachments,
    ];

    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid id" });

      const body = req.body as any;

      const dataToUpdate = {
        ...body,
        assignments: body.assignments
          ? body.assignments.map(Number)
          : undefined,
        attachments,
        recurring: body.recurring
          ? {
              frequency: body.recurring.frequency,
              next_due_date: body.recurring.next_due_date
                ? new Date(body.recurring.next_due_date)
                : undefined,
              end_date: body.recurring.end_date
                ? new Date(body.recurring.end_date)
                : undefined,
            }
          : undefined,
        due_date: body.due_date ? new Date(body.due_date) : undefined,
      };

      const updated = await serviceOrderService.updateServiceOrder(
        id,
        dataToUpdate
      );
      return res.status(200).json(updated);
    } catch (err) {
      for (const f of files) {
        try {
          const absPath = path.resolve(process.cwd(), toDbFilePath(f));
          if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
        } catch {}
      }
      next(err);
    }
  }

  async deleteServiceOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid id" });
      const result = await serviceOrderService.deleteServiceOrder(id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getOverdueOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const overdue = await serviceOrderService.getOverdueOrders();
      return res.status(200).json(overdue);
    } catch (err) {
      next(err);
    }
  }

/**
 * Download or preview an attachment by attachment_id
 * GET /api/service-orders/attachments/:id/download
 */
  async downloadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const attId = Number(req.params.id);
      if (Number.isNaN(attId))
        return res.status(400).json({ error: "Invalid attachment id" });

      const att = await db.Attachment.findByPk(attId);
      if (!att) return res.status(404).json({ error: "Attachment not found" });

      const absPath = path.resolve(process.cwd(), att.file_path);

      if (!fs.existsSync(absPath)) {
        return res.status(404).json({ error: "File not found on server" });
      }

      const isImage = att.file_type === "image";
      if (isImage) {
        return res.sendFile(absPath);
      } else {
        return res.download(absPath, att.original_name, (err) => {
          if (err) {
            console.error("Download error:", err);
            if (!res.headersSent)
              res.status(500).json({ error: "Failed to download file" });
          }
        });
      }
    } catch (err) {
      console.error("downloadAttachment error:", err);
      next(err);
    }
  }

  /**
   * List attachments for a service order
   * GET /api/service-orders/:id/attachments
   */
  async listAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Number(req.params.id);
      if (Number.isNaN(orderId))
        return res.status(400).json({ error: "Invalid order id" });

      const order = await serviceOrderService.getServiceOrderById(orderId);
      if (!order)
        return res.status(404).json({ error: "Service order not found" });

      const attachments = order.serviceOrderAttachments.map((att) => ({
        attachment_id: att.attachment_id,
        original_name: att.original_name,
        file_type: att.file_type,
        file_path: att.file_path,
        download_url: `http://localhost:3000/api/service-orders/attachments/${att.attachment_id}/download`,
      }));

      return res.status(200).json({ attachments });
    } catch (err) {
      next(err);
    }
  }
}

export default new ServiceOrderController();
