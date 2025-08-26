import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { CalendarDays, Users, TrendingUp, Target } from "lucide-react";
import type { ServiceOrderWithDetails, Employee } from "@shared/schema";

interface AnalyticsData {
  ordersByStatus: { status: string; count: number; color: string }[];
  ordersByType: { type: string; count: number }[];
  ordersByEmployee: { employee: string; count: number; completed: number; efficiency: number }[];
  monthlyPerformance: { month: string; total: number; completed: number; completion_rate: number }[];
  totalOrders: number;
  completedOrders: number;
  averageCompletionTime: number;
  topPerformer: string;
}

export default function Analytics() {
  const { data: orders = [], isLoading: ordersLoading } = useQuery<ServiceOrderWithDetails[]>({
    queryKey: ["/api/service-orders"],
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Process analytics data
  const analyticsData: AnalyticsData = React.useMemo(() => {
    if (!orders.length || !employees.length) {
      return {
        ordersByStatus: [],
        ordersByType: [],
        ordersByEmployee: [],
        monthlyPerformance: [],
        totalOrders: 0,
        completedOrders: 0,
        averageCompletionTime: 0,
        topPerformer: "N/A"
      };
    }

    // Orders by status
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusColors = {
      new: "#8884d8",
      assigned: "#82ca9d", 
      in_progress: "#ffc658",
      completed: "#ff7300",
      closed: "#8dd1e1"
    };

    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' ').toUpperCase(),
      count,
      color: statusColors[status as keyof typeof statusColors] || "#8884d8"
    }));

    // Orders by service type
    const typeCounts = orders.reduce((acc, order) => {
      acc[order.serviceType] = (acc[order.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ordersByType = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count
    }));

    // Orders by employee with efficiency
    const employeeStats = employees.map(tech => {
      const techOrders = orders.filter(order => order.employeeId === tech.id);
      const completedOrders = techOrders.filter(order => order.status === 'completed');
      const efficiency = techOrders.length > 0 ? Math.round((completedOrders.length / techOrders.length) * 100) : 0;
      
      return {
        employee: tech.name,
        count: techOrders.length,
        completed: completedOrders.length,
        efficiency
      };
    });

    // Monthly performance (last 6 months)
    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthOrders = orders.filter(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        return orderDate !== null && orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
      });
      
      const completed = monthOrders.filter(order => order.status === 'completed').length;
      const completion_rate = monthOrders.length > 0 ? Math.round((completed / monthOrders.length) * 100) : 0;
      
      return {
        month: monthName,
        total: monthOrders.length,
        completed,
        completion_rate
      };
    }).reverse();

    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const topPerformer = employeeStats.reduce((prev, current) => 
      (prev.efficiency > current.efficiency) ? prev : current
    ).employee;

    return {
      ordersByStatus,
      ordersByType,
      ordersByEmployee: employeeStats,
      monthlyPerformance: monthlyStats,
      totalOrders: orders.length,
      completedOrders,
      averageCompletionTime: 3.2, // Mock average in days
      topPerformer
    };
  }, [orders, employees]);

  if (ordersLoading || employeesLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-12">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-techflow-primary">Analytics Dashboard</h1>
          <p className="text-techflow-secondary mt-2">Comprehensive reports and performance insights</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.totalOrders > 0 ? Math.round((analyticsData.completedOrders / analyticsData.totalOrders) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageCompletionTime} days</div>
            <p className="text-xs text-muted-foreground">Average turnaround</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.topPerformer}</div>
            <p className="text-xs text-muted-foreground">Highest efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary">Service Order Summary</TabsTrigger>
          <TabsTrigger value="performance">Performance Report</TabsTrigger>
          <TabsTrigger value="efficiency">Employee Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>Distribution of service orders by current status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders by Service Type */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Service Type</CardTitle>
                <CardDescription>Breakdown of service requests by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.ordersByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trends</CardTitle>
              <CardDescription>Order volume and completion rates over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="total" fill="#8884d8" name="Total Orders" />
                  <Bar yAxisId="left" dataKey="completed" fill="#82ca9d" name="Completed Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="completion_rate" stroke="#ff7300" name="Completion Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Efficiency Report</CardTitle>
              <CardDescription>Performance metrics for each employee</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.ordersByEmployee.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{tech.employee}</h4>
                      <p className="text-sm text-muted-foreground">
                        {tech.completed} of {tech.count} orders completed
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Efficiency</div>
                        <Badge variant={tech.efficiency >= 80 ? "default" : tech.efficiency >= 60 ? "secondary" : "destructive"}>
                          {tech.efficiency}%
                        </Badge>
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${tech.efficiency >= 80 ? 'bg-green-500' : tech.efficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${tech.efficiency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}