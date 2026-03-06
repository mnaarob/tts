import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
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
              duration: 0.5
            }}>

            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6">
              Trusted by Canadian Businesses 🇨🇦
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
              Empower Your Canadian Business with{' '}
              <span className="text-blue-900">Tech to Store</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Professional websites, powerful SEO, and future-ready inventory
              management designed specifically for growing businesses.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a
                href="#contact"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2">

                Schedule a Demo
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#pricing"
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 rounded-xl font-semibold text-lg transition-all hover:-translate-y-1">

                View Pricing
              </a>
            </div>
          </motion.div>

          {/* Trust Badges */}
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
              duration: 0.5,
              delay: 0.2
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-200 pt-10">

            <div className="flex items-center justify-center gap-3 text-slate-600">
              <ShieldCheck className="w-6 h-6 text-blue-900" />
              <span className="font-medium">500+ Canadian Businesses</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span className="font-medium">99.9% Uptime Guarantee</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <MapPin className="w-6 h-6 text-red-500" />
              <span className="font-medium">Winnipeg-Based Support</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}