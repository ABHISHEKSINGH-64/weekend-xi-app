import React from 'react';

export const MatchCardSkeleton = () => {
  return (
    <div className="glass-panel rounded-3xl p-6 animate-pulse w-full space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-slate-800 rounded-full w-24"></div>
          <div className="h-7 bg-slate-800 rounded-full w-3/4"></div>
        </div>
        <div className="h-10 bg-slate-800 rounded-xl w-24"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-slate-800 rounded-full w-12"></div>
            <div className="h-5 bg-slate-800 rounded-full w-24"></div>
          </div>
        ))}
      </div>

      <div className="h-12 bg-slate-800 rounded-2xl w-full mt-4"></div>
    </div>
  );
};

export const AnnouncementSkeleton = () => {
  return (
    <div className="glass-panel rounded-3xl p-6 animate-pulse w-full space-y-4">
      <div className="h-5 bg-slate-800 rounded-full w-40"></div>
      <div className="h-4 bg-slate-800 rounded-full w-full"></div>
      <div className="h-4 bg-slate-800 rounded-full w-5/6"></div>
    </div>
  );
};

export const PlayerListSkeleton = () => {
  return (
    <div className="w-full space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-panel rounded-2xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded-full w-24"></div>
              <div className="h-3 bg-slate-800 rounded-full w-14"></div>
            </div>
          </div>
          <div className="h-6 bg-slate-800 rounded-full w-16"></div>
        </div>
      ))}
    </div>
  );
};
