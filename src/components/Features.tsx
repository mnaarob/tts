import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const stats = [
  {
    value: 'CA + US',
    label: 'Markets in view',
    detail: 'Early exploration — not a claim of national coverage',
  },
  {
    value: 'MVP',
    label: 'Product stage',
    detail: 'Learning with real storefronts; outcomes are not guaranteed',
  },
];

const work = [
  {
    name: "Millad's Supermarket",
    domain: 'milladssupermarket.com',
    href: 'https://milladssupermarket.com',
    image: '/images/work/millads.png',
    line: 'Grocery & pickup',
  },
  {
    name: 'Wallcome',
    domain: 'wallcome.site',
    href: 'https://wallcome.site',
    image: '/images/work/wallcome.png',
    line: 'Photography',
  },
  {
    name: 'Studio Abeda',
    domain: 'studioabeda.com',
    href: 'https://studioabeda.com',
    image: '/images/work/studioabeda.png',
    line: 'Art & shop',
  },
];

export function Features() {
  return (
    <section id="results" className="scroll-mt-20 py-20 sm:py-24 bg-white border-y border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <div className="flex items-baseline gap-4 mb-4">
              <h2 className="font-serif text-4xl sm:text-5xl text-ink tracking-tight">
                Selected work
              </h2>
              <span
                className="hidden sm:block flex-1 h-px bg-line translate-y-[-0.35rem]"
                aria-hidden
              />
            </div>
            <p className="text-muted leading-relaxed max-w-md mb-10">
              Example projects we have helped bring online — storefronts and
              brands that sell real things. Past work is illustrative only.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-5">
              {work.map((project, index) => (
                <motion.li
                  key={project.domain}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2">
                    <div className="relative overflow-hidden bg-line mb-3 border border-line">
                      <img
                        src={project.image}
                        alt={`Screenshot of ${project.name}`}
                        className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-1">
                      {project.line}
                    </p>
                    <p className="font-display font-bold text-ink tracking-brand group-hover:text-crimson transition-colors inline-flex items-center gap-1">
                      {project.name}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-sm text-muted mt-0.5">{project.domain}</p>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-8 lg:gap-10 lg:border-l lg:border-line lg:pl-12 lg:pt-2">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-5xl sm:text-6xl font-extrabold text-crimson tracking-brand leading-none mb-2">
                  {stat.value}
                </div>
                <div className="text-ink font-semibold">{stat.label}</div>
                <div className="text-sm text-muted">{stat.detail}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
