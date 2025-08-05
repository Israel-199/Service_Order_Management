const {
  ServiceOrder,
  Customer,
  Attachment,
  ServiceOrderAssignment,
  Employee,
  ServiceType,
  sequelize, // ← your connected Sequelize instance
  Sequelize, // ← the Sequelize class (for fn, col, etc.)
} = require("../models");

const { Op } = Sequelize;

class DashboaredService {
  async getDashboardData(recentDays = 7) {
    // ─── 1) Total orders ever ───────────────────────────────────────
    const totalOrders = await ServiceOrder.count();

    // ─── 2) In-progress orders ─────────────────────────────────────
    const inProgress = await ServiceOrder.count({
      where: { status: "in_progress" },
    });

    // ─── 3) Completed today ────────────────────────────────────────
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const completedToday = await ServiceOrder.count({
      where: {
        status: "completed",
        updated_at: { [Op.gte]: startOfToday },
      },
    });

    // ─── 4) Active technicians ────────────────────────────────────
    // Distinct employees assigned to any non-final order
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

    // ─── 5) Recent service orders ──────────────────────────────────
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
      limit: 10, // optionally cap how many you return
    });

    const recent = recentOrders.map((o) => ({
      orderId: o.order_id,
      serviceTypeName: o.ServiceType?.name || null,
      customerName: o.Customer?.name || null,
      customerEmail: o.Customer?.email || null,
      status: o.status,
      priority: o.priority,
      createdAt: o.created_at,
      assignedEmployees: o.ServiceOrderAssignments.map((a) => ({
        name: a.Employee?.name || null,
        email: a.Employee?.email || null,
      })),
      attachments: o.Attachments.map((a) => ({
        file_path: a.file_path,
        file_type: a.file_type,
      })),
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
    // ─── 1) Total + Completed + Rate ────────────────────────────────────
    const totalOrders = await ServiceOrder.count();
    const completedOrders = await ServiceOrder.count({
      where: { status: "completed" },
    });
    const completionRate =
      totalOrders > 0
        ? parseFloat(((completedOrders / totalOrders) * 100).toFixed(2))
        : 0;

    // ─── 2) Avg completion time (in days) ──────────────────────────────
    const completedRows = await ServiceOrder.findAll({
      where: { status: "completed" },
      attributes: ["created_at", "updated_at"],
      raw: true,
    });
    const totalDays = completedRows.reduce((sum, r) => {
      const created = new Date(r.created_at);
      const done = new Date(r.updated_at);
      return sum + (done - created) / (1000 * 60 * 60 * 24);
    }, 0);
    const avgCompletionTimeDays =
      completedRows.length > 0
        ? parseFloat((totalDays / completedRows.length).toFixed(2))
        : 0;

    // ─── 3) Technician efficiency data ──────────────────────────────────
    const effRows = await ServiceOrderAssignment.findAll({
      attributes: [
        "employees_id",
        [Sequelize.col("Employee.name"), "employee_name"],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.fn(
              "DISTINCT",
              Sequelize.col("ServiceOrderAssignment.order_id")
            )
          ),
          "assigned_count",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              `CASE WHEN ServiceOrder.status='completed' THEN 1 ELSE 0 END`
            )
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
    const technicianEfficiency = effRows.map((r) => {
      const assigned = parseInt(r.assigned_count, 10);
      const completed = parseInt(r.completed_count, 10);
      return {
        employees_id: r.employees_id,
        employee_name: r.employee_name,
        assigned_orders: assigned,
        completed_orders: completed,
        efficiency_percentage:
          assigned > 0
            ? parseFloat(((completed / assigned) * 100).toFixed(2))
            : 0,
      };
    });

    // ─── 4) Top performer ───────────────────────────────────────────────
    const topPerformer = technicianEfficiency.reduce(
      (best, tech) => {
        return tech.efficiency_percentage > (best.efficiency_percentage || 0)
          ? tech
          : best;
      },
      { efficiency_percentage: 0, employee_name: null }
    );

    // ─── 5) Counts by service type ──────────────────────────────────────
    const typeRows = await ServiceOrder.findAll({
      attributes: [
        "service_type_id",
        [Sequelize.fn("COUNT", Sequelize.col("order_id")), "count"],
      ],
      group: ["service_type_id"],
      raw: true,
    });
    const countsByServiceType = typeRows.map((r) => ({
      service_type_id: parseInt(r.service_type_id, 10),
      count: parseInt(r.count, 10),
    }));

    // ─── 6) Status percentages ─────────────────────────────────────────
    const statusRows = await ServiceOrder.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("order_id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });
    const totalForPct = statusRows.reduce(
      (sum, r) => sum + parseInt(r.count, 10),
      0
    );
    const statuses = ["new", "assigned", "in_progress", "completed", "closed"];
    const statusPercentages = statuses.map((s) => {
      const row = statusRows.find((r) => r.status === s);
      const cnt = row ? parseInt(row.count, 10) : 0;
      return {
        status: s,
        percentage:
          totalForPct > 0
            ? parseFloat(((cnt / totalForPct) * 100).toFixed(2))
            : 0,
      };
    });

    // ─── 7) Monthly performance trends (last 6 months) ────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    // MySQL DATE_FORMAT; switch to `TO_CHAR` if Postgres
    const trendRows = await ServiceOrder.findAll({
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("created_at"), "%Y-%m"),
          "month",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("order_id")), "total"],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(`CASE WHEN status='completed' THEN 1 ELSE 0 END`)
          ),
          "completed",
        ],
      ],
      where: { created_at: { [Op.gte]: sixMonthsAgo } },
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    });
    const monthlyTrends = trendRows.map((r) => ({
      month: r.month, // e.g. "2025-02"
      total: parseInt(r.total, 10),
      completionRate: parseFloat(((r.completed / r.total) * 100).toFixed(2)),
    }));

    return {
      totalOrders,
      completedOrders,
      completionRate,
      avgCompletionTimeDays,
      topPerformer, // { employee_name, efficiency_percentage }
      countsByServiceType,
      technicianEfficiency,
      statusPercentages,
      monthlyTrends,
    };
  }
}

module.exports = new DashboaredService();
