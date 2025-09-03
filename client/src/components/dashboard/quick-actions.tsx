import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, UserPlus, TrendingUp, Users } from "lucide-react";

interface QuickActionsProps {
  onCreateOrder: () => void;
}

export default function QuickActions({ onCreateOrder }: QuickActionsProps) {
  return (
    <Card className="shadow-sm border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-techflow-primary">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button 
            onClick={onCreateOrder}
            className="w-full bg-primary text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Order
          </Button>
          
          <Link href="/customers">
            <Button className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
          
          <Link href="/reports">
            <Button className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </Link>
          
          <Link href="/employees">
            <Button 
              variant="outline" 
              className="w-full border-border text-techflow-primary hover:bg-muted transition-colors"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Team
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
