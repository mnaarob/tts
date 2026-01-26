import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flag, Users, TrendingUp } from 'lucide-react';
const features = [
{
  title: 'Fast Setup',
  description:
  'Launch in days, not months. Our streamlined process gets your business online quickly without compromising quality.',
  icon: Zap
},
{
  title: 'Canadian Focus',
  description:
  'Built for Canadian businesses, regulations, and market nuances. We understand the local landscape better than anyone.',
  icon: Flag
},
{
  title: 'Expert Support',
  description:
  'Winnipeg-based team, real humans. No chatbots or offshore call centers—just dedicated local support when you need it.',
  icon: Users
},
{
  title: 'Scalable Growth',
  description:
  'Grow from startup to enterprise. Our platform evolves with your business needs, handling increased traffic and complexity.',
  icon: TrendingUp
}];

export function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-slate-900 text-white overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{
              opacity: 0,
              x: -20
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6
            }}>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Built for Performance,
              <br />
              Designed for Trust
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Store Warden isn't just another software provider. We're your
              technology partner, committed to the long-term success of your
              business with tools that actually work.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, index) =>
              <div key={feature.title} className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-800/50 flex items-center justify-center text-emerald-400">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6
            }}
            className="relative">

            <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">
                  98
                </div>
                <div>
                  <div className="text-sm text-slate-400">SEO Health Score</div>
                  <div className="text-xl font-bold">Excellent Performance</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{
                      width: 0
                    }}
                    whileInView={{
                      width: '92%'
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.5
                    }}
                    className="h-full bg-blue-500" />

                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mobile Optimization</span>
                  <span className="font-mono text-blue-400">92%</span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mt-6">
                  <motion.div
                    initial={{
                      width: 0
                    }}
                    whileInView={{
                      width: '98%'
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.7
                    }}
                    className="h-full bg-emerald-500" />

                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Site Speed</span>
                  <span className="font-mono text-emerald-400">98%</span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mt-6">
                  <motion.div
                    initial={{
                      width: 0
                    }}
                    whileInView={{
                      width: '100%'
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.9
                    }}
                    className="h-full bg-purple-500" />

                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Security Compliance</span>
                  <span className="font-mono text-purple-400">100%</span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>);

}