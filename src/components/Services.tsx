import React from 'react';
import { motion } from 'framer-motion';
import { Globe, LineChart, PackageSearch } from 'lucide-react';
const services = [
{
  title: 'Website Creation',
  description:
  'Custom, mobile-responsive websites built for conversions. We design digital experiences that turn visitors into loyal customers.',
  icon: Globe,
  color: 'bg-blue-100 text-blue-700',
  status: 'Available Now'
},
{
  title: 'SEO Services',
  description:
  'Rank higher on Google with expert optimization. Our local SEO strategies help Canadian customers find you first.',
  icon: LineChart,
  color: 'bg-emerald-100 text-emerald-700',
  status: 'Available Now'
},
{
  title: 'Inventory Management',
  description:
  'Future-ready tools to scale your operations. Track stock, manage suppliers, and automate reordering in one place.',
  icon: PackageSearch,
  color: 'bg-purple-100 text-purple-700',
  status: 'Coming Soon'
}];

export function Services() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to Grow
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive solutions tailored for the modern Canadian business
            landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) =>
          <motion.div
            key={service.title}
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.1
            }}
            className="relative p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">

              <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${service.color}`}>

                <service.icon className="w-7 h-7" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">
                  {service.title}
                </h3>
                {service.status === 'Coming Soon' &&
              <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
              }
              </div>

              <p className="text-slate-600 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}