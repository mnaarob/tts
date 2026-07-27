import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-charcoal text-white/70 py-16 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-5">
              <Logo className="w-8 h-8" />
              <span className="font-display font-bold text-lg tracking-brand lowercase text-white">
                tech to store
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm text-white/55">
              An initiative exploring websites, local SEO, inventory tools, and
              mobile applications with retailers.
            </p>
            <p className="mt-4 text-sm text-white/80">
              Built for stores that sell real things.
            </p>
          </div>

          <div className="md:col-span-2 md:col-start-8">
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/#/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/#/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors">
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="/#/accessibility"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-white mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:contact@techtostore.com"
                  className="hover:text-white transition-colors whitespace-nowrap">
                  contact@techtostore.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Tech to Store</p>
          <p>An initiative for retailers that sell real things.</p>
        </div>
      </div>
    </footer>
  );
}
