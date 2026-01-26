import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
const plans = [
{
  id: 'starter',
  name: 'Starter',
  price: '$499',
  period: 'one-time',
  description: 'Perfect for small businesses just getting started online.',
  features: [
  'Professional Website',
  'Basic SEO Setup',
  'Mobile Responsive',
  'SSL Security',
  'Monthly Analytics Report'],

  cta: 'Get Started',
  popular: false
},
{
  id: 'professional',
  name: 'Professional',
  price: '$999',
  period: 'one-time',
  description: 'Comprehensive solution for growing businesses.',
  features: [
  'Everything in Starter',
  'Advanced SEO Strategy',
  'Priority Support',
  'Content Updates (2 hrs/mo)',
  'Performance Optimization',
  'Quarterly Strategy Call'],

  cta: 'Get Started',
  popular: true
},
{
  id: 'enterprise',
  name: 'Enterprise',
  price: '$1499',
  period: 'one-time',
  description: 'Tailored solutions for large-scale operations.',
  features: [
  'Full Custom Website',
  'Dedicated Account Manager',
  'Custom Integrations',
  '24/7 Priority Support',
  'Multi-location SEO',
  'Inventory Management Beta'],

  cta: 'Get Started',
  popular: false
}];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the plan that fits your business stage. One-time investment,
            lifetime value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) =>
          <motion.div
            key={plan.name}
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
            className={`relative flex flex-col p-8 rounded-2xl border ${plan.popular ? 'border-blue-200 bg-blue-50/50 shadow-xl scale-105 z-10' : 'border-slate-200 bg-white shadow-sm hover:shadow-md'} transition-all duration-300`}>

              {plan.popular &&
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
            }

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                    {plan.period}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) =>
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-slate-700">

                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
              )}
              </ul>

              <Link
              to={`/checkout?plan=${plan.id}`}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${plan.popular ? 'bg-blue-900 text-white hover:bg-blue-800 hover:shadow-lg' : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-900'}`}>

                {plan.cta}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}