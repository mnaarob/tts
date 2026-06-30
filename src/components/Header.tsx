import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks = [
  {
    name: 'Services',
    target: 'services'
  },
  {
    name: 'Features',
    target: 'features'
  }];

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        const target = document.getElementById(id);
        target?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Logo className="w-9 h-9 text-slate-900 group-hover:text-slate-700 transition-colors" />
            <span
              className={`font-bold text-xl tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>

              Tech to Store
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <button
              type="button"
              key={link.name}
              onClick={() => scrollToSection(link.target)}
              className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors cursor-pointer bg-transparent border-none p-0">

                {link.name}
              </button>
            )}
            <Link
              to="/themes"
              className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors">
              Templates
            </Link>
            {user ? (
              <Link
                to="/inventory"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5">
                My Inventory
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5">
                  Create account
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu">

            {isMobileMenuOpen ?
            <X className="w-6 h-6" /> :

            <Menu className="w-6 h-6" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen &&
        <motion.div
          initial={{
            opacity: 0,
            height: 0
          }}
          animate={{
            opacity: 1,
            height: 'auto'
          }}
          exit={{
            opacity: 0,
            height: 0
          }}
          className="md:hidden bg-white border-t border-slate-100 overflow-hidden">

            <div className="px-4 py-6 space-y-4 flex flex-col">
              {navLinks.map((link) =>
            <button
              type="button"
              key={link.name}
              className="text-base font-medium text-slate-600 hover:text-blue-900 py-2 text-left bg-transparent border-none p-0 cursor-pointer"
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection(link.target);
              }}>

                  {link.name}
                </button>
            )}
              <Link
                to="/themes"
                className="text-base font-medium text-slate-600 hover:text-blue-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}>
                Templates
              </Link>
              {user ? (
                <Link
                  to="/inventory"
                  className="bg-emerald-500 text-white px-5 py-3 rounded-lg text-center font-semibold mt-4"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  My Inventory
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-base font-medium text-slate-600 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-emerald-500 text-white px-5 py-3 rounded-lg text-center font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Create account
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}