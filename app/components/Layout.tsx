import { Outlet, Link, useLocation } from "react-router";
import { Home, Leaf, Plug, TrendingUp, Award, MessageCircle, Heart, Sun, Bell, User, Menu } from "lucide-react";
import { useState } from "react";
import goldLogo from "../images/GOLDENERGY.png";

export function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/mygreen-score", icon: Leaf, label: "MyGreen Score" },
    { path: "/smartplug", icon: Plug, label: "SmartPlug" },
    { path: "/powerpredict", icon: TrendingUp, label: "PowerPredict" },
    { path: "/rewards", icon: Award, label: "GoldRewards" },
    { path: "/chatbot", icon: MessageCircle, label: "Chatbot" },
    { path: "/goldcare", icon: Heart, label: "GoldCare" },
    { path: "/solar", icon: Sun, label: "SolarMatch" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white text-gray-800 p-4 flex items-center justify-between border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">
            <Menu size={24} />
          </button>
          <img src={goldLogo} alt="Gold Energy" className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          <Link to="/notifications" className="relative">
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Link>
          <Link to="/profile">
            <User size={24} />
          </Link>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b">
          <nav className="p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                    isActive ? "bg-blue-50 text-[#3B7DB7]" : "text-gray-700"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r min-h-screen">
          <nav className="p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                    isActive ? "bg-blue-50 text-[#3B7DB7]" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white text-gray-800 flex items-center justify-around p-3 shadow-lg border-t border-gray-200">
        <Link to="/" className={location.pathname === "/" ? "text-[#3B7DB7]" : "text-gray-400"}>
          <Home size={24} />
        </Link>
        <Link to="/mygreen-score" className={location.pathname === "/mygreen-score" ? "text-[#3B7DB7]" : "text-gray-400"}>
          <Leaf size={24} />
        </Link>
        <Link to="/rewards" className={location.pathname === "/rewards" ? "text-[#3B7DB7]" : "text-gray-400"}>
          <Award size={24} />
        </Link>
        <Link to="/chatbot" className={location.pathname === "/chatbot" ? "text-[#3B7DB7]" : "text-gray-400"}>
          <MessageCircle size={24} />
        </Link>
      </nav>
    </div>
  );
}
