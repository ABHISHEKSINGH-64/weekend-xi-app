import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { IoShieldOutline, IoLockClosedOutline, IoKeyOutline } from 'react-icons/io5';

const AdminLogin = () => {
  const { user, adminLogin, loading: authLoading } = useAuth();
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
      setError('Admin name is required');
      return;
    }
    if (!accessCode.trim()) {
      setError('Admin access code is required');
      return;
    }

    setLoading(true);
    const result = await adminLogin(name, accessCode);
    setLoading(false);

    if (result.success) {
      showToast('Welcome, Administrator!', 'success');
      navigate('/admin-dashboard');
    } else {
      setError(result.message);
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-y-auto pt-20 pb-8">
      {/* Decorative Pitch Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-blue-500/5 rounded-full filter blur-[80px] sm:blur-[100px] pointer-events-none z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-sm sm:max-w-md p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl relative z-10 space-y-5 sm:space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-1">
            <IoShieldOutline className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin Portal</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium font-inter">Enter administrative credentials to proceed</p>
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
          {/* Admin Name Field */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Admin Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Admin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Admin Access Code Field */}
          <div className="space-y-1.5 relative">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">Admin Access Code</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="glass-input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3.5 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </div>
            ) : (
              <>
                <IoKeyOutline className="w-5 h-5" />
                Authenticate
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
