import React from 'react';
import { motion } from 'framer-motion';
import {
  PackageIcon,
  DollarSignIcon,
  AlertTriangleIcon,
  ClockIcon } from
'lucide-react';
const stats = [
{
  label: 'Total Products',
  value: '1',
  icon: PackageIcon,
  bgColor: 'bg-indigo-50',
  iconColor: 'text-indigo-600',
  borderColor: 'border-indigo-200'
},
{
  label: 'Inventory Value',
  value: '$10.99',
  icon: DollarSignIcon,
  bgColor: 'bg-emerald-50',
  iconColor: 'text-emerald-600',
  borderColor: 'border-emerald-200'
},
{
  label: 'Low Stock Alerts',
  value: '1',
  icon: AlertTriangleIcon,
  bgColor: 'bg-amber-50',
  iconColor: 'text-amber-600',
  borderColor: 'border-amber-200',
  valueColor: 'text-amber-600'
},
{
  label: 'Expiring Soon',
  value: '1',
  icon: ClockIcon,
  bgColor: 'bg-red-50',
  iconColor: 'text-red-600',
  borderColor: 'border-red-200',
  valueColor: 'text-red-600'
}];

export function StatCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.1
            }}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-2xl p-3 sm:p-5 shadow-sm`}>

            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`text-xs sm:text-sm font-medium ${stat.valueColor ? stat.valueColor : 'text-slate-600'}`}>

                  {stat.label}
                </p>
                <p
                  className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${stat.valueColor || 'text-slate-900'}`}>

                  {stat.value}
                </p>
              </div>
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </motion.div>);

      })}
    </div>);

}