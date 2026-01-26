import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
const testimonials = [
{
  quote:
  'Store Warden transformed our online presence. Sales up 40% in 3 months. The team understood exactly what we needed as a local retailer.',
  author: 'Sarah Chen',
  role: 'Owner, Maple Goods Co.',
  image: 'SC'
},
{
  quote:
  "Best decision for our business. The SEO results speak for themselves. We're finally ranking on the first page for our key terms.",
  author: 'James Park',
  role: 'Founder, Northern Supply',
  image: 'JP'
},
{
  quote:
  'Professional, responsive, and truly understands Canadian small business. It feels like having an in-house tech team.',
  author: 'Maria Santos',
  role: 'CEO, Coastal Crafts',
  image: 'MS'
}];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trusted by Canadian Leaders
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join hundreds of businesses that rely on Store Warden for their
            digital success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) =>
          <motion.div
            key={item.author}
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
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">

              <Quote className="w-8 h-8 text-blue-200 mb-6" />
              <p className="text-slate-700 mb-8 leading-relaxed italic">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                  {item.image}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{item.author}</div>
                  <div className="text-sm text-slate-500">{item.role}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}