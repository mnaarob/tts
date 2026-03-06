import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboardIcon,
  PackageIcon,
  TagIcon,
  TrendingUpIcon,
  BarChart3Icon,
  XIcon,
  CodeIcon } from
'lucide-react';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
const navItems = [
{
  icon: LayoutDashboardIcon,
  label: 'Dashboard',
  active: true
},
{
  icon: PackageIcon,
  label: 'Products',
  active: false
},
{
  icon: TagIcon,
  label: 'Categories',
  active: false
},
{
  icon: TrendingUpIcon,
  label: 'Stock',
  active: false
},
{
  icon: BarChart3Icon,
  label: 'Reports',
  active: false
}];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Slide over */}
      <AnimatePresence>
        {isOpen &&
        <>
            {/* Backdrop */}
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 0.2
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose} />


            {/* Sidebar Panel */}
            <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-[min(280px,85vw)] max-w-[280px] bg-white z-50 lg:hidden shadow-2xl">

              <div className="flex items-center justify-between p-4 border-b border-slate-200 safe-area-top">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <CodeIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-slate-900">Tech to Store</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl hover:bg-slate-100 active:bg-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  aria-label="Close sidebar"
                >
                  <XIcon className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        }
      </AnimatePresence>
    </>);

}
function SidebarContent() {
  return (
    <nav className="flex-1 p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
        My Inventory
      </p>
      <ul className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[48px] ${item.active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100 text-slate-900'}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${item.active ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            </li>);

        })}
      </ul>
    </nav>);

}