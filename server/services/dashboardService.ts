// services/dashboardService.ts
import { Op, Sequelize } from "sequelize";
import { db } from "../models";

const {
  ServiceOrder,
  Customer,
  Attachment,
  ServiceOrderAssignment,
  Employee,
  ServiceType,
} = db;

interface RecentOrder {
  orderId: number;
  serviceTypeName?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  status?: string;
  priority?: string;
  createdAt?: Date | null;
  assignedEmployees: { name?: string | null; email?: string | null }[];
  attachments: {
    attachment_id?: number;
    original_name?: string | null;
    file_path?: string | null;
    file_type?: string | null;
    download_url?: string;
  }[];
}

interface TechnicianEfficiency {
  employee_id: number;
  employee_name: string | null;
  assigned_orders: number;
  completed_orders: number;
  efficiency_percentage: number;
}

interface TopPerformer {
  employee_id: number;
  employee_name: string | null;
  efficiency_percentage: number;
}

interface CountByServiceType {
  service_type_id: number;
  count: number;
}

interface StatusPercentage {
  status: string;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  total: number;
  completionRate: number;
}

interface TopAttachedOrder {
  orderId: number;
  attachmentCount: number;
  serviceTypeName?: string | null;
}

class DashboardService {
  async getDashboardData(recentDays = 7) {
    // 1) Total orders ever
    const totalOrders = await ServiceOrder.count();

    // 2) In-progress orders
    const inProgress = await ServiceOrder.count({
      where: { status: "in_progress" },
    });

    // 3) Completed today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const completedToday = await ServiceOrder.count({
      where: {
        status: "completed",
        updated_at: { [Op.gte]: startOfToday },
      },
    });

    // 4) Active technicians (distinct employees assigned to non-final orders)
    const activeTechnicians = await ServiceOrderAssignment.count({
      distinct: true,
      col: "employee_id",
      include: [
        {
          model: ServiceOrder,
          where: { status: { [Op.in]: ["new", "assigned", "in_progress"] } },
          attributes: [],
        },
      ],
    });

    // 5) Recent service orders (with attachments)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - recentDays);

    const recentOrders = await ServiceOrder.findAll({
      where: { created_at: { [Op.gte]: cutoff } },
      include: [
        { model: ServiceType, attributes: ["name"] },
        { model: Customer, attributes: ["name", "email"] },
        {
          model: ServiceOrderAssignment,
          include: [{ model: Employee, attributes: ["name", "email"] }],
        },
        // include attachments with full metadata
        {
          model: Attachment,
          attributes: ["attachment_id", "original_name", "file_path", "file_type"],
        },
      ],
      attributes: ["order_id", "status", "priority", "created_at"],
      order: [["created_at", "DESC"]],
      limit: 10,
    });

    const recent: RecentOrder[] = (recentOrders as any[]).map((o: any) => ({
      orderId: o.order_id,
      serviceTypeName: o.ServiceType?.name ?? null,
      customerName: o.Customer?.name ?? null,
      customerEmail: o.Customer?.email ?? null,
      status: typeof o.status === "string" ? o.status : undefined,
      priority: typeof o.priority === "string" ? o.priority : undefined,
      createdAt: o.created_at ?? null,
      assignedEmployees:
        (o.ServiceOrderAssignments ?? []).map((a: any) => ({
          name: a.Employee?.name ?? null,
          email: a.Employee?.email ?? null,
        })) ?? [],
      attachments:
        (o.Attachments ?? []).map((a: any) => ({
          attachment_id: a.attachment_id,
          original_name: a.original_name ?? null,
          file_path: a.file_path ?? null,
          file_type: a.file_type ?? null,
          download_url: a.attachment_id
            ? `http://localhost:3000/api/service-orders/attachments/${a.attachment_id}/download`
            : undefined,
        })) ?? [],
    }));

    return {
      totalOrders,
      inProgress,
      completedToday,
      activeTechnicians,
      recentOrders: recent,
    };
  }

  async getAnalyticData() {
    // 1) Total + Completed + Rate
    const totalOrders = await ServiceOrder.count();
    const completedOrders = await ServiceOrder.count({
      where: { status: "completed" },
    });
    const completionRate =
      totalOrders > 0 ? parseFloat(((completedOrders / totalOrders) * 100).toFixed(2)) : 0;

    // 2) Avg completion time (in days)
    const completedRows: any[] = await ServiceOrder.findAll({
      where: { status: "completed" },
      attributes: ["created_at", "updated_at"],
      raw: true,
    });
    const totalDays = completedRows.reduce((sum: number, r: any) => {
      const created = new Date(r.created_at);
      const done = new Date(r.updated_at);
      return sum + (done.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    const avgCompletionTimeDays =
      completedRows.length > 0 ? parseFloat((totalDays / completedRows.length).toFixed(2)) : 0;

    // 3) Technician efficiency data (raw)
    // Use quoted alias in CASE literal so Postgres recognizes the joined alias.
    const effRows: any[] = await ServiceOrderAssignment.findAll({
      attributes: [
        "employee_id",
        [Sequelize.col("Employee.name"), "employee_name"],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.fn("DISTINCT", Sequelize.col("ServiceOrderAssignment.order_id"))
          ),
          "assigned_count",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(`CASE WHEN "ServiceOrder"."status" = 'completed' THEN 1 ELSE 0 END`)
          ),
          "completed_count",
        ],
      ],
      include: [
        { model: ServiceOrder, attributes: [] }, // ensure "ServiceOrder" alias exists
        { model: Employee, attributes: [] },
      ],
      group: ["ServiceOrderAssignment.employee_id", "Employee.name"],
      raw: true,
    });

    const technicianEfficiency: TechnicianEfficiency[] = effRows.map((r: any) => {
      const assigned = Number(r.assigned_count) || 0;
      const completed = Number(r.completed_count) || 0;
      return {
        employee_id: Number(r.employee_id) || 0,
        employee_name: r.employee_name ?? null,
        assigned_orders: assigned,
        completed_orders: completed,
        efficiency_percentage: assigned > 0 ? parseFloat(((completed / assigned) * 100).toFixed(2)) : 0,
      };
    });

    // 4) Top performer (safe initial accumulator)
    const topInitial: TopPerformer = {
      employee_id: 0,
      employee_name: null,
      efficiency_percentage: 0,
    };
    const topPerformer = technicianEfficiency.length
      ? technicianEfficiency.reduce((best, tech) =>
          tech.efficiency_percentage > best.efficiency_percentage ? tech : best,
        topInitial)
      : topInitial;

    // 5) Counts by service type (raw)
    const typeRows: any[] = await ServiceOrder.findAll({
      attributes: ["service_type_id", [Sequelize.fn("COUNT", Sequelize.col("order_id")), "count"]],
      group: ["service_type_id"],
      raw: true,
    });
    const countsByServiceType: CountByServiceType[] = typeRows.map((r: any) => ({
      service_type_id: Number(r.service_type_id) || 0,
      count: Number(r.count) || 0,
    }));

    // 6) Status percentages (raw)
    const statusRows: any[] = await ServiceOrder.findAll({
      attributes: ["status", [Sequelize.fn("COUNT", Sequelize.col("order_id")), "count"]],
      group: ["status"],
      raw: true,
    });
    const totalForPct = statusRows.reduce((sum: number, r: any) => sum + (Number(r.count) || 0), 0);
    const statuses = ["new", "assigned", "in_progress", "completed", "closed"];
    const statusPercentages: StatusPercentage[] = statuses.map((s) => {
      const row = statusRows.find((r: any) => r.status === s);
      const cnt = row ? Number(row.count) || 0 : 0;
      return {
        status: s,
        percentage: totalForPct > 0 ? parseFloat(((cnt / totalForPct) * 100).toFixed(2)) : 0,
      };
    });

    // 7) Monthly performance trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    // Use TO_CHAR for Postgres; if you run MySQL you'll want to change this back to DATE_FORMAT
    const trendRows: any[] = await ServiceOrder.findAll({
      attributes: [
        [Sequelize.fn("TO_CHAR", Sequelize.col("created_at"), "YYYY-MM"), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("order_id")), "total"],
        [
          Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "ServiceOrder"."status" = 'completed' THEN 1 ELSE 0 END`)),
          "completed",
        ],
      ],
      where: { created_at: { [Op.gte]: sixMonthsAgo } },
      group: ["month"],
      order: [[Sequelize.literal("month"), "ASC"]],
      raw: true,
    });

    const monthlyTrends: MonthlyTrend[] = trendRows.map((r: any) => ({
      month: r.month,
      total: Number(r.total) || 0,
      completionRate:
        r.total && Number(r.total) > 0 ? parseFloat(((Number(r.completed) / Number(r.total)) * 100).toFixed(2)) : 0,
    }));

    // --- Attachment analytics additions ---

    // total attachments across all orders
    const totalAttachments = await Attachment.count();

    // top attached orders (order_id + count) - get top 5 order_ids by attachment count
    const topAttachedAgg: any[] = await Attachment.findAll({
      attributes: [
        "order_id",
        [Sequelize.fn("COUNT", Sequelize.col("attachment_id")), "attachment_count"],
      ],
      group: ["order_id"],
      order: [[Sequelize.literal("attachment_count"), "DESC"]],
      limit: 5,
      raw: true,
    });

    // fetch service type (name) for those orders to make the response nicer
    const topOrderIds = topAttachedAgg.map((r) => Number(r.order_id));
    let topAttachedOrders: TopAttachedOrder[] = [];
    if (topOrderIds.length > 0) {
      const ordersInfo = await ServiceOrder.findAll({
        where: { order_id: { [Op.in]: topOrderIds } },
        include: [{ model: ServiceType, attributes: ["name"] }],
        attributes: ["order_id", "service_type_id"],
      });

      const infoById: Record<number, any> = {};
      for (const o of ordersInfo as any[]) {
        infoById[o.order_id] = { serviceTypeName: o.ServiceType?.name ?? null };
      }

      topAttachedOrders = topAttachedAgg.map((r) => ({
        orderId: Number(r.order_id),
        attachmentCount: Number(r.attachment_count) || 0,
        serviceTypeName: infoById[Number(r.order_id)]?.serviceTypeName ?? null,
      }));
    }

    return {
      totalOrders,
      completedOrders,
      completionRate,
      avgCompletionTimeDays,
      topPerformer,
      countsByServiceType,
      technicianEfficiency,
      statusPercentages,
      monthlyTrends,
      // new attachment-related analytics
      totalAttachments,
      topAttachedOrders,
    };
  }
}

export default new DashboardService();
