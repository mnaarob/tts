import React from 'react';
import { MenuIcon, LogOutIcon, CodeIcon } from 'lucide-react';
interface DashboardHeaderProps {
  onMenuClick: () => void;
}
export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-sm safe-area-top">
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 -ml-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <CodeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 truncate">Tech to Store</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <span className="text-xs sm:text-sm text-slate-600 hidden sm:block truncate max-w-[140px]">
            Fresh Grocery Mart
          </span>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-xl min-h-[44px] min-w-[44px] sm:min-w-0 justify-center transition-colors">
            <LogOutIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );

}