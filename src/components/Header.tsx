import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

type HeaderProps = {
  /** Transparent over a dark hero until the user scrolls. */
  overHero?: boolean;
};

export function Header({ overHero = false }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onDark = overHero && !isScrolled;

  const navLinks = [
    { name: 'Services', target: 'services' },
    { name: 'Results', target: 'results' },
  ];

  function scrollToSection(id: string) {
    const doScroll = () => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    };

    if (document.getElementById(id)) {
      doScroll();
      return;
    }
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(doScroll, 150);
    }
  }

  function handleMobileNavClick(target: string) {
    setIsMobileMenuOpen(false);
    window.setTimeout(() => scrollToSection(target), 200);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled || !overHero
          ? 'bg-paper/95 backdrop-blur-md border-b border-line py-3'
          : 'bg-transparent border-b border-transparent py-5'
      }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <Logo className="w-8 h-8" />
            <span
              className={`font-display font-bold text-[1.05rem] tracking-brand lowercase transition-colors ${
                onDark ? 'text-white' : 'text-ink'
              }`}>
              tech to store
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.name}
                onClick={() => scrollToSection(link.target)}
                className={`text-sm font-medium transition-colors cursor-pointer bg-transparent border-none p-0 ${
                  onDark
                    ? 'text-white/80 hover:text-white'
                    : 'text-muted hover:text-ink'
                }`}>
                {link.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollToSection('templates')}
              className={`text-sm font-medium transition-colors cursor-pointer bg-transparent border-none p-0 ${
                onDark
                  ? 'text-white/80 hover:text-white'
                  : 'text-muted hover:text-ink'
              }`}>
              Templates
            </button>
            {user ? (
              <Link
                to="/inventory"
                className="bg-crimson hover:bg-crimson-hover text-white px-4 py-2 text-sm font-semibold transition-colors">
                My Inventory
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors ${
                    onDark
                      ? 'text-white/80 hover:text-white'
                      : 'text-muted hover:text-ink'
                  }`}>
                  Sign in
                </Link>
                <Link
                  to="/contact"
                  className="bg-crimson hover:bg-crimson-hover text-white px-4 py-2 text-sm font-semibold transition-colors">
                  Talk to us
                </Link>
              </>
            )}
          </nav>

          <button
            className={`md:hidden p-2 ${onDark ? 'text-white' : 'text-ink'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-paper border-t border-line overflow-hidden">
            <div className="px-4 py-6 space-y-1 flex flex-col">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.name}
                  className="text-base font-medium text-ink py-2.5 text-left bg-transparent border-none p-0 cursor-pointer"
                  onClick={() => handleMobileNavClick(link.target)}>
                  {link.name}
                </button>
              ))}
              <button
                type="button"
                className="text-base font-medium text-ink py-2.5 text-left bg-transparent border-none p-0 cursor-pointer"
                onClick={() => handleMobileNavClick('templates')}>
                Templates
              </button>
              {user ? (
                <Link
                  to="/inventory"
                  className="bg-crimson text-white px-5 py-3 text-center font-semibold mt-3"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  My Inventory
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-base font-medium text-muted py-2.5"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                  <Link
                    to="/contact"
                    className="bg-crimson text-white px-5 py-3 text-center font-semibold mt-2"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Talk to us
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
