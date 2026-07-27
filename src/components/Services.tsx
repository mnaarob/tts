import { motion } from 'framer-motion';

const services = [
  {
    num: '01',
    title: 'Websites',
    description:
      'Storefronts designed to feel like your shop — clear, practical, and built around how you sell.',
  },
  {
    num: '02',
    title: 'Local SEO',
    description:
      'Practical setup to help neighbourhood customers discover you online — results vary by market and effort.',
  },
  {
    num: '03',
    title: 'Inventory',
    description:
      'Tools meant to help you see stock across shelves before you sell what you cannot fulfil.',
  },
  {
    num: '04',
    title: 'Mobile application',
    description:
      'Cross-platform apps for iOS and Android — subject to each app store’s review and policies.',
  },
];

const SIDE_IMAGE = '/images/services-dashboard.png';

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 py-20 sm:py-28 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <div className="flex items-baseline gap-4 mb-12">
              <h2 className="font-serif text-4xl sm:text-5xl text-ink tracking-tight">
                What we build
              </h2>
              <span
                className="hidden sm:block flex-1 h-px bg-line translate-y-[-0.35rem]"
                aria-hidden
              />
            </div>

            <ul className="divide-y divide-line border-y border-line">
              {services.map((service, index) => (
                <motion.li
                  key={service.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="py-8 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2">
                  <span className="font-display text-sm font-semibold text-crimson tracking-wide pt-1">
                    {service.num}
                  </span>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-brand mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted leading-relaxed max-w-md">
                      {service.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            className="lg:col-span-6 lg:sticky lg:top-28"
            initial={{ opacity: 0, scale: 1.02 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <figure className="relative aspect-[4/5] overflow-hidden bg-line">
              <img
                src={SIDE_IMAGE}
                alt="Retail operator reviewing an inventory dashboard on a laptop"
                className="h-full w-full object-cover"
              />
            </figure>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
