import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { StatCards } from './components/StatCards';
import { AlertBanners } from './components/AlertBanners';
import { RecentProducts } from './components/RecentProducts';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-100 md:bg-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
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
    </div>
  );
}