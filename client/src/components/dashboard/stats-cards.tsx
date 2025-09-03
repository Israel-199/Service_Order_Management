import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Loader, CheckCircle, Users } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalOrders: number;
    inProgress: number;
    completedToday: number;
    activeEmployees: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm border border-border">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      change: "+12%",
      changeText: "from last month",
      icon: ClipboardList,
      iconBg: "bg-blue-100 dark:bg-blue-950/50",
      iconColor: "text-primary",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      change: "+8%",
      changeText: "from yesterday",
      icon: Loader,
      iconBg: "bg-orange-100 dark:bg-orange-950/50",
      iconColor: "text-orange-600",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      change: "+25%",
      changeText: "from average",
      icon: CheckCircle,
      iconBg: "bg-green-100 dark:bg-green-950/50",
      iconColor: "text-green-600",
    },
    {
      title: "Active Employees",
      value: stats.activeEmployees,
      change: "All online",
      changeText: "currently",
      icon: Users,
      iconBg: "bg-purple-100 dark:bg-purple-950/50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="shadow-sm border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-techflow-primary mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`${card.iconColor} text-xl`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{card.change}</span>
              <span className="text-muted-foreground ml-1">{card.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
