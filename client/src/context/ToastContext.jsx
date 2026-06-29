import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle, IoClose } from 'react-icons/io5';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`glass-panel flex items-start gap-3 p-4 rounded-2xl shadow-2xl border-l-4 ${
                toast.type === 'success' ? 'border-l-green-500' : 
                toast.type === 'error' ? 'border-l-red-500' : 'border-l-blue-500'
              }`}>
                {/* Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {toast.type === 'success' && <IoCheckmarkCircle className="w-5 h-5 text-green-500" />}
                  {toast.type === 'error' && <IoCloseCircle className="w-5 h-5 text-red-500" />}
                  {toast.type === 'info' && <IoInformationCircle className="w-5 h-5 text-blue-500" />}
                </div>

                {/* Message */}
                <div className="flex-1 text-sm font-medium text-slate-100 pr-2">
                  {toast.message}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                >
                  <IoClose className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
