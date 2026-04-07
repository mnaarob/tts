import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user } = useAuth();
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
    href: '#services'
  },
  {
    name: 'Features',
    href: '#features'
  },
  {
    name: 'Pricing',
    href: '#pricing'
  }];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-900 p-1.5 rounded-lg group-hover:bg-blue-800 transition-colors">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span
              className={`font-bold text-xl tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>

              Tech to Store
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors">

                {link.name}
              </a>
            )}
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
            <a
              key={link.name}
              href={link.href}
              className="text-base font-medium text-slate-600 hover:text-blue-900 py-2"
              onClick={() => setIsMobileMenuOpen(false)}>

                  {link.name}
                </a>
            )}
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