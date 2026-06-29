import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
  const cardClasses = `glass-panel rounded-3xl p-6 ${
    hoverEffect ? 'glass-panel-hover cursor-default' : ''
  } ${className}`;

  if (hoverEffect) {
    return (
      <motion.div
        className={cardClasses}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
