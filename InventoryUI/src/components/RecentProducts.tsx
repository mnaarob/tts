import React from 'react';
import { motion } from 'framer-motion';
import {
  SearchIcon,
  ScanLineIcon,
  PlusIcon,
  ChevronRightIcon } from
'lucide-react';
const products = [
{
  id: 1,
  name: 'Aveeno Baby Lotion',
  sku: '062600500496',
  category: '-',
  price: '$10.99',
  qty: 1,
  website: 'Draft',
  badges: [
  {
    label: 'Low stock',
    color: 'bg-amber-100 text-amber-700'
  },
  {
    label: 'Expires in 15 days',
    color: 'bg-red-100 text-red-700'
  }]

}];

export function RecentProducts() {
  return (
    <motion.div
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
        delay: 0.6
      }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Products
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full sm:w-48 pl-9 pr-4 py-2.5 min-h-[44px] text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons - stacked on mobile, row on desktop */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors">
                <ScanLineIcon className="w-4 h-4" />
                <span>Scan to add</span>
              </button>
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-colors">
                <PlusIcon className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 md:px-6 py-3">
                Product
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 md:px-6 py-3">SKU</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 md:px-6 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 md:px-6 py-3">Price</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 md:px-6 py-3">Qty</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 md:px-6 py-3">Website</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 md:px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) =>
            <tr
              key={product.id}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors">

                <td className="px-4 md:px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-medium text-slate-900">
                      {product.name}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.badges.map((badge) =>
                    <span
                      key={badge.label}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>

                          {badge.label}
                        </span>
                    )}
                    </div>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 text-sm text-slate-600 font-mono">
                  {product.sku}
                </td>
                <td className="px-4 md:px-6 py-4 text-sm text-slate-600">
                  {product.category}
                </td>
                <td className="px-4 md:px-6 py-4 text-sm font-medium text-slate-900">
                  {product.price}
                </td>
                <td className="px-4 md:px-6 py-4">
                  <span className="text-sm font-medium text-amber-600">
                    {product.qty}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {product.website}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <button className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    Edit
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-200">
        {products.map((product) => (
          <div key={product.id} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-500 font-mono mt-0.5 truncate">
                  {product.sku}
                </p>
              </div>
              <button className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors flex-shrink-0">
                Edit
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.badges.map((badge) =>
            <span
              key={badge.label}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>

                  {badge.label}
                </span>
            )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-slate-500">Price: </span>
                <span className="font-medium text-slate-900">
                  {product.price}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Qty: </span>
                <span className="font-medium text-amber-600">
                  {product.qty}
                </span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {product.website}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

}