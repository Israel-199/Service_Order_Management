// services/dashboardService.ts
import { db } from "../models";
import { Op, Sequelize } from "sequelize";

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
  attachments: { file_path?: string | null; file_type?: string | null }[];
}

interface TechnicianEfficiency {
  employees_id: number;
  employee_name: string | null;
  assigned_orders: number;
  completed_orders: number;
  efficiency_percentage: number;
}

interface TopPerformer {
  employees_id: number;
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
      col: "employees_id",
      include: [
        {
          model: ServiceOrder,
          where: { status: { [Op.in]: ["new", "assigned", "in_progress"] } },
          attributes: [],
        },
      ],
    });

    // 5) Recent service orders
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
        { model: Attachment, attributes: ["file_path", "file_type"] },
      ],
      attributes: ["order_id", "status", "priority", "created_at"],
      order: [["created_at", "DESC"]],
      limit: 10,
    });

    const recent: RecentOrder[] = recentOrders.map((o: any) => ({
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
        })) || [],
      attachments:
        (o.Attachments ?? []).map((a: any) => ({
          file_path: a.file_path ?? null,
          file_type: a.file_type ?? null,
        })) || [],
    }));

    return {
      totalOrders,
      inProgress,
      completedToday,
      activeTechnicians,
      recentOrders: recent,
    };
  }
//  async getAnalyticData(p0?: { recentDays: number; }) {
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
    const effRows: any[] = await ServiceOrderAssignment.findAll({
      attributes: [
        "employees_id",
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
            Sequelize.literal(`CASE WHEN ServiceOrder.status='completed' THEN 1 ELSE 0 END`)
          ),
          "completed_count",
        ],
      ],
      include: [
        { model: ServiceOrder, attributes: [] },
        { model: Employee, attributes: [] },
      ],
      group: ["ServiceOrderAssignment.employees_id", "Employee.name"],
      raw: true,
    });

    const technicianEfficiency: TechnicianEfficiency[] = effRows.map((r: any) => {
      const assigned = Number(r.assigned_count) || 0;
      const completed = Number(r.completed_count) || 0;
      return {
        employees_id: Number(r.employees_id) || 0,
        employee_name: r.employee_name ?? null,
        assigned_orders: assigned,
        completed_orders: completed,
        efficiency_percentage: assigned > 0 ? parseFloat(((completed / assigned) * 100).toFixed(2)) : 0,
      };
    });

    // 4) Top performer (provide a safe typed initial accumulator)
    const topInitial: TopPerformer = {
      employees_id: 0,
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

    const trendRows: any[] = await ServiceOrder.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("created_at"), "%Y-%m"), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("order_id")), "total"],
        [
          Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN status='completed' THEN 1 ELSE 0 END`)),
          "completed",
        ],
      ],
      where: { created_at: { [Op.gte]: sixMonthsAgo } },
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    });

    const monthlyTrends: MonthlyTrend[] = trendRows.map((r: any) => ({
      month: r.month,
      total: Number(r.total) || 0,
      completionRate: r.total ? parseFloat(((Number(r.completed) / Number(r.total)) * 100).toFixed(2)) : 0,
    }));

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
    };
  }
}

export default new DashboardService();
