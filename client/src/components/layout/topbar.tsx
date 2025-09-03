import NotificationCenter from "./notification-center";
import { Moon, Sun, PanelLeft, Columns2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarHidden, setSidebarHidden] = useState<boolean>(() => {
    try { return localStorage.getItem("sidebarHidden") === "1"; } catch { return false; }
  });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = (saved as "light" | "dark" | null) ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleSidebar = () => {
    setSidebarHidden((prev) => {
      const next = !prev;
      try { localStorage.setItem("sidebarHidden", next ? "1" : "0"); } catch {}
      // Fire a storage event to inform Sidebar component in other tabs/contexts, and force re-render via event
      try { window.dispatchEvent(new StorageEvent("storage", { key: "sidebarHidden", newValue: next ? "1" : "0" })); } catch {}
      return next;
    });
  };

  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-techflow-primary">Dashboard</h2>
          <p className="text-techflow-secondary">Welcome back, Dawit Hailu</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            aria-label={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
            className="p-2 rounded-md border border-border hover:bg-muted text-sm"
            onClick={toggleSidebar}
          >
            {sidebarHidden ? <Columns2 className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          
          </button>
          <button
            aria-label="Toggle theme"
            className="p-2 rounded-md border border-border hover:bg-muted"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <NotificationCenter />
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">DH</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-techflow-primary">Dawit Hailu</p>
              <p className="text-xs text-techflow-secondary">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
