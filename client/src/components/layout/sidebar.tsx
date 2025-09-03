import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Wrench, 
  BarChart3, 
  Settings, 
  Receipt,
  PanelLeft,
  Columns2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
 

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Service Orders", href: "/service-orders", icon: ClipboardList },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Employees", href: "/employees", icon: Wrench },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  // State to control visibility
  const [hidden, setHidden] = useState(false);

  // Load initial value from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sidebarHidden");
    setHidden(stored === "1");
  }, []);

  // Listen for changes triggered elsewhere (Topbar toggle button)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("sidebarHidden");
      setHidden(stored === "1");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  },[]);
  
  
  return (
    <aside className={cn("bg-card shadow-lg flex-shrink-0 transition-[width] duration-200", hidden ? "hidden" : "block")}
      aria-hidden={hidden? "true" : "false"}
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Wrench className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-techflow-primary">Afronex</h1>
            <p className="text-sm text-techflow-secondary">Service Management</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                    isActive
                      ? "text-primary bg-muted"
                      : "text-techflow-secondary hover:text-techflow-primary hover:bg-muted"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
