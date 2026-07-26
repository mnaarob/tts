import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTheme } from '../data/themes';

const FEATURED = [
  {
    slug: 'market' as const,
    label: 'Market',
    storeName: 'Riverbend Market',
    line: 'Good food. Local people.',
  },
  {
    slug: 'granary' as const,
    label: 'Bakery',
    storeName: 'Prairie Loaf',
    line: 'Fresh bread. Every day.',
    imageOverride: '/themes/_assets/products/bread-sourdough.jpg',
  },
  {
    slug: 'boucherie' as const,
    label: 'Butcher',
    storeName: 'Fort Garry Butcher',
    line: 'Quality meat. Done right.',
  },
];

export function ThemesPeek() {
  return (
    <section id="templates" className="scroll-mt-20 py-20 sm:py-28 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl text-ink tracking-tight">
            Built for how you sell
          </h2>
          <Link
            to="/themes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-crimson hover:text-crimson-hover transition-colors self-start sm:self-auto">
            View more themes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURED.map((item, index) => {
            const theme = getTheme(item.slug);
            const image = item.imageOverride ?? theme?.thumbnailPath ?? '';
            return (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}>
                <Link
                  to={`/themes/${item.slug}`}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2">
                  <div className="relative aspect-[4/5] overflow-hidden bg-ink mb-4">
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="font-display text-xl font-bold tracking-brand mb-1">
                        {item.storeName}
                      </p>
                      <p className="text-sm text-white/80">{item.line}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-1">
                    {item.label}
                  </p>
                  <p className="font-medium text-ink group-hover:text-crimson transition-colors">
                    {theme?.displayName ?? item.label} theme
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
