import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusOverviewProps {
  stats?: {
    statusCounts: Record<string, number>;
  };
}

export default function StatusOverview({ stats }: StatusOverviewProps) {
  const statusConfig = [
    { key: "new", label: "New", color: "bg-gray-400 dark:bg-gray-500" },
    { key: "assigned", label: "Assigned", color: "bg-blue-500" },
    { key: "in_progress", label: "In Progress", color: "bg-orange-500" },
    { key: "completed", label: "Completed", color: "bg-green-500" },
    { key: "closed", label: "Closed", color: "bg-gray-600" },
  ];

  if (!stats) {
    return (
      <Card className="shadow-sm border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-techflow-primary">
            Order Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statusConfig.map((status) => (
              <div key={status.key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${status.color} rounded-full`}></div>
                  <span className="text-sm text-techflow-primary">{status.label}</span>
                </div>
                <div className="w-6 h-4 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-techflow-primary">
          Order Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusConfig.map((status) => (
            <div key={status.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${status.color} rounded-full`}></div>
                <span className="text-sm text-techflow-primary">{status.label}</span>
              </div>
              <span className="text-sm font-medium text-techflow-primary">
                {stats.statusCounts[status.key] || 0}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
