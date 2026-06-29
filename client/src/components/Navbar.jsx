import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMenu, IoClose, IoExitOutline, IoCalendarOutline, IoShieldOutline } from 'react-icons/io5';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getLinks = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Login', path: '/login' },
        { label: 'Admin', path: '/admin' }
      ];
    }
    if (user.role === 'admin') {
      return [
        { label: 'Home', path: '/' },
        { label: 'Admin Panel', path: '/admin-dashboard', icon: <IoShieldOutline /> }
      ];
    }
    return [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard', icon: <IoCalendarOutline /> }
    ];
  };

  const links = getLinks();

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Weekend XI
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 group-hover:bg-green-500/20 transition-all duration-300">
              PG
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'text-green-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {link.icon}
                  {link.label}
                </span>
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 ml-4 px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-all duration-200"
              >
                <IoExitOutline className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>

          {/* Hamburger Menu Icon */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              {isOpen ? <IoClose className="w-6 h-6" /> : <IoMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-xl text-base font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                >
                  <IoExitOutline className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
