import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { StatCards } from './components/StatCards';
import { AlertBanners } from './components/AlertBanners';
import { RecentProducts } from './components/RecentProducts';
import { LayoutDashboardIcon, PackageIcon, TagIcon, TrendingUpIcon, BarChart3Icon } from 'lucide-react';

const BOTTOM_NAV_ITEMS = [
  { icon: LayoutDashboardIcon, label: 'Dashboard' },
  { icon: PackageIcon, label: 'Products' },
  { icon: TagIcon, label: 'Categories' },
  { icon: TrendingUpIcon, label: 'Stock' },
  { icon: BarChart3Icon, label: 'Reports' },
];

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-100 md:bg-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 pb-20 lg:pb-0">
        {/* Header */}
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-0.5 text-sm sm:text-base">Overview of your inventory</p>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <StatCards />
          </div>

          {/* Alerts */}
          <div className="mb-6">
            <AlertBanners />
          </div>

          {/* Recent Products */}
          <RecentProducts />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/80 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center h-16 px-2">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === 'Dashboard';
            return (
              <button
                key={item.label}
                className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[56px] rounded-xl transition-colors ${
                  isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700 active:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}