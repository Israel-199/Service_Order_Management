import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Employee, ServiceOrderWithDetails } from "@shared/schema";

interface EmployeeStatusProps {
  employees: Employee[];
  orders: ServiceOrderWithDetails[];
}

export default function EmployeeStatus({ employees, orders }: EmployeeStatusProps) {
  // Calculate active orders per employee
  const employeeOrderCounts = employees.map(employee => {
    const activeOrders = orders.filter(
      order => order.employeeId === employee.id && 
      !["completed", "closed"].includes(order.status)
    ).length;
    
    return {
      ...employee,
      activeOrders,
    };
  });

  const getStatusColor = (orderCount: number) => {
    if (orderCount === 0) return "bg-green-500";
    if (orderCount <= 2) return "bg-green-500";
    if (orderCount <= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", 
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
      "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  if (employees.length === 0) {
    return (
      <Card className="shadow-sm border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-techflow-primary">
            Employee Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No employees available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-techflow-primary">
          Employees Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {employeeOrderCounts.slice(0, 5).map((employee) => (
            <div key={employee.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarBg(employee.name)}`}>
                  <span className="text-xs font-medium">
                    {getInitials(employee.name)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-techflow-primary">
                    {employee.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {employee.activeOrders} active order{employee.activeOrders !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className={`w-2 h-2 ${getStatusColor(employee.activeOrders)} rounded-full`}></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
