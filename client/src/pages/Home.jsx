import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { GiCricketBat } from 'react-icons/gi';
import { IoArrowForwardOutline } from 'react-icons/io5';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoin = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Decorative Pitch Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full filter blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full filter blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto px-4 text-center z-10 space-y-8 select-none">
        {/* Animated Cricket Icon Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-lg text-green-400 font-semibold text-xs sm:text-sm"
        >
          <GiCricketBat className="w-4 h-4 animate-bounce" />
          PG Weekend Cricket League
        </motion.div>

        {/* Hero Headlines */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white"
          >
            Weekend <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">XI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-300 tracking-wide"
          >
            One Tap. One Team. Every Weekend.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-slate-400 max-w-xs sm:max-w-lg mx-auto text-xs sm:text-sm lg:text-base font-medium"
          >
            Say goodbye to messy WhatsApp groups. Mark your attendance, see live player counts, and join the match with a single tap. Only for PG residents.
          </motion.p>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={handleJoin}
            className="group relative flex items-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-green-500/20 hover:shadow-green-500/35 hover:-translate-y-0.5 transition-all duration-300 pointer-events-auto text-sm sm:text-base"
          >
            Join the Weekend Match
            <IoArrowForwardOutline className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
