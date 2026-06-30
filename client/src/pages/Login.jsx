import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { IoPersonOutline, IoHomeOutline, IoKeyOutline, IoPlayCircleOutline } from 'react-icons/io5';

const Login = () => {
  const { user, login, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatically redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!accessCode.trim()) {
      setError('Access Code is required');
      return;
    }

    // Extract room number from access code
    const cleanName = name.replace(/[^a-zA-Z]/g, '');
    const prefix = cleanName.substring(0, 4).toUpperCase();
    const upperAccessCode = accessCode.trim().toUpperCase();

    if (!upperAccessCode.startsWith(prefix)) {
      setError(`Access code must start with '${prefix}' (first 4 letters of your name)`);
      return;
    }

    const roomNumber = upperAccessCode.substring(prefix.length);
    if (!roomNumber) {
      setError(`Access code must end with your room number (e.g. ${prefix}501)`);
      return;
    }

    setLoading(true);
    const result = await login(name, roomNumber, accessCode);
    setLoading(false);

    if (result.success) {
      showToast('Welcome to Weekend XI!', 'success');
      navigate('/dashboard');
    } else {
      setError(result.message);
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-y-auto pt-20 pb-8">
      {/* Decorative Radial pitch blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-green-500/5 rounded-full filter blur-[80px] sm:blur-[100px] pointer-events-none z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-sm sm:max-w-md p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl relative z-10 space-y-5 sm:space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Player Login</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Verify your PG residency to check in</p>
        </div>

        {/* Error Callout */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Arun Sagar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Access Code Field */}
          <div className="space-y-1.5 relative">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Access Code</label>
            <div className="relative">
              <input
                type="text"
                placeholder="FIRST 4 LETTERS OF NAME + ROOM"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="glass-input uppercase"
                disabled={loading}
              />
            </div>

            {/* Generated Code Helper */}
            {name.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs flex justify-between items-center text-slate-400 bg-slate-800/40 border border-slate-700/30 rounded-xl px-3 py-2 font-medium"
              >
                <span>Example code for room "501":</span>
                <span className="font-mono font-bold text-green-400 tracking-wider bg-green-500/10 px-2 py-0.5 rounded border border-green-500/15">
                  {name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()}501
                </span>
              </motion.div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3.5 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-green-500/10 hover:shadow-green-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </div>
            ) : (
              <>
                <IoPlayCircleOutline className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
