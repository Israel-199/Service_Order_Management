import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import StatsCards from "@/components/dashboard/stats-cards";
import OrderTable from "@/components/service-orders/order-table";
import StatusOverview from "@/components/dashboard/status-overview";
import QuickActions from "@/components/dashboard/quick-actions";
import  EmployeeStatus from "@/components/dashboard/employee-status";
import CreateOrderModal from "@/components/service-orders/create-order-modal";
import { useState } from "react";
import type { ServiceOrderWithDetails, Employee } from "@shared/schema";

export default function Dashboard() {
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalOrders: number;
    inProgress: number;
    completedToday: number;
    activeEmployees: number;
    statusCounts: Record<string, number>;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<ServiceOrderWithDetails[]>({
    queryKey: ["/api/service-orders"],
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees/active"],
  });

  // Get recent orders (last 10)
  const recentOrders = orders
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 10);

  if (statsLoading || ordersLoading || employeesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-techflow-primary">Dashboard</h2>
          <p className="text-techflow-secondary">Welcome back,  Dawit Hailu</p>
        </div>
        <div className="text-center py-8">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-border">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-techflow-primary">Recent Service Orders</h3>
                <button 
                  onClick={() => setIsCreateOrderOpen(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  <i className="fas fa-plus mr-2"></i>New Order
                </button>
              </div>
            </div>
            <OrderTable orders={recentOrders} showPagination={false} />
          </Card>
        </div>

        <div className="space-y-6">
          {stats && <StatusOverview stats={{ statusCounts: stats.statusCounts }} />}
          <QuickActions onCreateOrder={() => setIsCreateOrderOpen(true)} />
          <EmployeeStatus employees={employees} orders={orders} />
        </div>
      </div>

      <CreateOrderModal 
        open={isCreateOrderOpen} 
        onOpenChange={setIsCreateOrderOpen}
      />
    </div>
  );
}
