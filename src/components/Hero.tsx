import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HERO_IMAGE = '/themes/_assets/heroes/hero-2.jpg';

export function Hero() {
  return (
    <section className="relative flex min-h-dvh items-start sm:items-end bg-ink">
      {/* Image clipped separately so hero copy is never cut off on short phones */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden>
        <img
          src={HERO_IMAGE}
          alt=""
          className="h-full w-full object-cover object-[center_30%] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/25 to-transparent" />
      </motion.div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-36 sm:pb-20 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl">
          <h1 className="font-display font-extrabold text-white tracking-brand text-[2.5rem] leading-[1.05] mb-3 sm:mb-6 sm:text-[clamp(3.25rem,10vw,6.5rem)] sm:leading-[0.92]">
            Tech to Store
          </h1>
          <p className="font-serif text-lg sm:text-2xl md:text-3xl text-white/95 leading-snug mb-2 sm:mb-4 max-w-xl">
            Digital tools for stores that sell real things.
          </p>
          <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-5 sm:mb-8 max-w-lg">
            An early-stage Winnipeg initiative exploring websites, local SEO,
            and inventory tools with retailers in Canada and the United States.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center bg-crimson hover:bg-crimson-hover text-white px-5 py-3 sm:px-6 sm:py-3.5 text-sm font-semibold tracking-wide transition-colors">
            Talk to us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
