import React from 'react';
import { motion } from 'framer-motion';
import { 
  IoCalendarOutline, 
  IoMegaphoneOutline, 
  IoPeopleOutline, 
  IoCloudOfflineOutline 
} from 'react-icons/io5';
import { GiCricketBat } from 'react-icons/gi';

const EmptyState = ({ type = 'match', title, description }) => {
  const getConfig = () => {
    switch (type) {
      case 'match':
        return {
          icon: <GiCricketBat className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Match Scheduled',
          defaultDesc: 'See You Next Weekend!'
        };
      case 'announcement':
        return {
          icon: <IoMegaphoneOutline className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Announcements Yet',
          defaultDesc: 'Check back later.'
        };
      case 'players':
        return {
          icon: <IoPeopleOutline className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Players Have Responded',
          defaultDesc: 'Be the first to join this weekend\'s match.'
        };
      case 'offline':
        return {
          icon: <IoCloudOfflineOutline className="w-12 h-12 text-red-400" />,
          defaultTitle: 'No Internet Connection',
          defaultDesc: 'Please check your connection and try again.'
        };
      default:
        return {
          icon: <IoCalendarOutline className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Data',
          defaultDesc: 'No information available.'
        };
    }
  };

  const config = getConfig();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto w-full py-12"
    >
      <div className="p-4 rounded-full bg-slate-800/60 border border-slate-700/50">
        {config.icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold tracking-tight text-white">
          {title || config.defaultTitle}
        </h3>
        <p className="text-sm text-slate-400 font-medium">
          {description || config.defaultDesc}
        </p>
      </div>
    </motion.div>
  );
};

export default EmptyState;
