import NotificationCenter from "./notification-center";

export default function TopBar() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-techflow-primary">Dashboard</h2>
          <p className="text-techflow-secondary">Welcome back, Dawit Hailu</p>
        </div>
        <div className="flex items-center space-x-4">
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
