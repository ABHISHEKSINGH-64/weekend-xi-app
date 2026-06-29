import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useCountdown } from '../hooks/useCountdown';
import { matchService, responseService } from '../services/api';
import { getAvatarInitials, getAvatarGradient } from '../utils/avatar';
import GlassCard from '../components/GlassCard';
import EmptyState from '../components/EmptyState';
import { MatchCardSkeleton, AnnouncementSkeleton, PlayerListSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoCalendarOutline, 
  IoLocationOutline, 
  IoTimeOutline, 
  IoPersonOutline, 
  IoMegaphoneOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoPeopleOutline,
  IoTimerOutline
} from 'react-icons/io5';

const Dashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { showToast } = useToast();

  const [match, setMatch] = useState(null);
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState({ playing: [], notComing: [], noResponse: [] });
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('playing'); // playing, notComing, noResponse

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const matchRes = await matchService.getActive();
      setMatch(matchRes.match);
      setStats(matchRes.stats);

      const playersRes = await responseService.getPlayers();
      setPlayers(playersRes);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('match_updated', (data) => {
      setMatch(data.match);
      setStats(data.stats);
    });

    socket.on('response_updated', (data) => {
      setPlayers(data);
    });

    // If new player registers, refetch player lists
    socket.on('player_registered', () => {
      fetchData();
    });

    return () => {
      socket.off('match_updated');
      socket.off('response_updated');
      socket.off('player_registered');
    };
  }, [socket, fetchData]);

  // Compute countdown target details
  const countdown = useCountdown(match?.date, match?.time);

  // Check if current user has already responded
  const getUserResponse = () => {
    if (!user) return null;
    const playingFind = players.playing.find(p => p._id === user.id);
    if (playingFind) return 'Playing';
    
    const notComingFind = players.notComing.find(p => p._id === user.id);
    if (notComingFind) return 'Not Coming';
    
    return null;
  };

  const userSelection = getUserResponse();
  const hasResponded = userSelection !== null;

  const handleVote = async (status) => {
    if (hasResponded || btnLoading) return;
    try {
      setBtnLoading(true);
      const data = await responseService.submit(status);
      setPlayers(data.groups);
      showToast(`Response submitted: ${status === 'Playing' ? "I'M IN" : "CAN'T MAKE IT"}`, 'success');
    } catch (error) {
      const message = error.response?.data?.message || 'Error submitting response';
      showToast(message, 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  // Format YYYY-MM-DD to readable format
  const formatMatchDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Convert 24hr string to 12hr AM/PM format
  const formatMatchTime = (timeStr) => {
    if (!timeStr) return '';
    const [hourStr, minStr] = timeStr.split(':');
    const hours = parseInt(hourStr);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minStr} ${ampm}`;
  };

  // Format helper for Last Updated Time
  const formatUpdatedTime = (updatedAtStr) => {
    if (!updatedAtStr) return '';
    const date = new Date(updatedAtStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Progress Bar Variables
  const playingCount = stats?.playing || 0;
  const totalPlayers = stats?.totalPlayers || 0;
  const progressPercent = totalPlayers > 0 ? (playingCount / totalPlayers) * 100 : 0;
  const minPlayers = 10;
  const matchConfirmed = playingCount >= minPlayers;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12 space-y-6">
        <MatchCardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <AnnouncementSkeleton />
          </div>
          <PlayerListSkeleton />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-12">
        <EmptyState type="match" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8 select-none">
      
      {/* 1. MATCH HERO CARD */}
      <GlassCard className="relative overflow-hidden border border-slate-700/40">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full filter blur-[80px] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
          
          {/* Match Title & Info */}
          <div className="space-y-4 flex-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase tracking-wider">
              <IoCalendarOutline className="w-3.5 h-3.5" /> Upcoming Match
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Weekend XI Cricket Match
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2.5 text-slate-300">
                <IoLocationOutline className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm font-semibold truncate">{match.ground}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <IoCalendarOutline className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm font-semibold">{formatMatchDate(match.date)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <IoTimeOutline className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm font-semibold">{formatMatchTime(match.time)}</span>
              </div>
            </div>
            
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <IoPersonOutline className="w-3.5 h-3.5" /> Scheduled by {match.createdBy?.name || 'Admin'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IoTimerOutline className="w-3.5 h-3.5" /> Sync Live • Updated {formatUpdatedTime(match.updatedAt)}
              </span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center min-w-[240px] shadow-inner">
            {countdown.isExpired ? (
              <div className="text-slate-400 text-sm font-bold uppercase tracking-widest py-3">
                🏏 Match in Progress
              </div>
            ) : (
              <div className="space-y-1 w-full">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Time Remaining</span>
                <div className="flex items-center justify-center gap-2 font-mono text-2xl font-extrabold text-white">
                  <div className="flex flex-col items-center">
                    <span className="text-green-400 text-3xl">{String(countdown.days).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">Days</span>
                  </div>
                  <span className="text-green-500 animate-blink">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-green-400 text-3xl">{String(countdown.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">Hrs</span>
                  </div>
                  <span className="text-green-500 animate-blink">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-green-400 text-3xl">{String(countdown.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">Mins</span>
                  </div>
                  <span className="text-green-500 animate-blink">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-green-400 text-3xl">{String(countdown.seconds).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">Secs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. MATCH STATUS & PROGRESS BAR */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <IoPeopleOutline className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-slate-200">
                {playingCount} / {totalPlayers} Players Confirmed
              </span>
            </div>
            <div>
              <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                matchConfirmed 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {matchConfirmed ? '🎉 Match Confirmed!' : `Need ${minPlayers - playingCount} More Players`}
              </span>
            </div>
          </div>
          
          {/* Progress track */}
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progressPercent)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </GlassCard>

      {/* 3. USER ACTIONS & DETAIL PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT/MID SECTION: Response buttons and Announcements */}
        <div className="md:col-span-2 space-y-6">
          
          {/* VOTE CARD */}
          <GlassCard className="border border-slate-700/40">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                📢 Will you make it this weekend?
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* I'M IN Button */}
                <button
                  onClick={() => handleVote('Playing')}
                  disabled={hasResponded || btnLoading}
                  className={`group py-4 px-6 rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                    hasResponded 
                      ? userSelection === 'Playing'
                        ? 'bg-green-500/20 text-green-400 border-2 border-green-500 shadow-lg shadow-green-500/10'
                        : 'bg-slate-900/40 text-slate-600 border border-slate-800 opacity-40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 hover:-translate-y-0.5 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 active:scale-[0.98]'
                  }`}
                >
                  <IoCheckmarkCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm tracking-wider uppercase font-extrabold">I'M IN</span>
                </button>

                {/* CAN'T MAKE IT Button */}
                <button
                  onClick={() => handleVote('Not Coming')}
                  disabled={hasResponded || btnLoading}
                  className={`group py-4 px-6 rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                    hasResponded 
                      ? userSelection === 'Not Coming'
                        ? 'bg-red-500/20 text-red-400 border-2 border-red-500 shadow-lg shadow-red-500/10'
                        : 'bg-slate-900/40 text-slate-600 border border-slate-800 opacity-40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white hover:-translate-y-0.5 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 active:scale-[0.98]'
                  }`}
                >
                  <IoCloseCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm tracking-wider uppercase font-extrabold">CAN'T MAKE IT</span>
                </button>
              </div>

              {hasResponded && (
                <div className="text-xs text-slate-400 font-semibold text-center mt-2 flex items-center justify-center gap-1 bg-slate-900/40 py-2 rounded-xl border border-slate-800/80">
                  🔒 Responses are locked. Ask the Admin if you need to reset.
                </div>
              )}
            </div>
          </GlassCard>

          {/* ANNOUNCEMENT CARD */}
          <GlassCard className="border border-slate-700/40">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <IoMegaphoneOutline className="w-5 h-5 text-green-400" /> Match Announcements
              </h3>
              
              {match.announcement ? (
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200 text-sm font-semibold leading-relaxed whitespace-pre-line shadow-inner">
                  {match.announcement}
                </div>
              ) : (
                <EmptyState type="announcement" />
              )}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT SECTION: Players check-in statuses list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              👥 Players List
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700/60">
              Live
            </span>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('playing')}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'playing'
                  ? 'bg-green-500 text-slate-950 font-extrabold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IN ({players.playing.length})
            </button>
            <button
              onClick={() => setActiveTab('notComing')}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'notComing'
                  ? 'bg-red-500 text-white font-extrabold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OUT ({players.notComing.length})
            </button>
            <button
              onClick={() => setActiveTab('noResponse')}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'noResponse'
                  ? 'bg-slate-800 text-slate-300 font-extrabold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WAITING ({players.noResponse.length})
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {activeTab === 'playing' && (
                <React.Fragment key="playing-tab">
                  {players.playing.length > 0 ? (
                    players.playing.map((player) => (
                      <PlayerListItem key={player._id} player={player} badgeColor="bg-green-500/10 text-green-400 border-green-500/20" />
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-500 py-10 font-bold">No players marked IN yet.</div>
                  )}
                </React.Fragment>
              )}
              {activeTab === 'notComing' && (
                <React.Fragment key="notComing-tab">
                  {players.notComing.length > 0 ? (
                    players.notComing.map((player) => (
                      <PlayerListItem key={player._id} player={player} badgeColor="bg-red-500/10 text-red-400 border-red-500/20" />
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-500 py-10 font-bold">No players marked OUT yet.</div>
                  )}
                </React.Fragment>
              )}
              {activeTab === 'noResponse' && (
                <React.Fragment key="noResponse-tab">
                  {players.noResponse.length > 0 ? (
                    players.noResponse.map((player) => (
                      <PlayerListItem key={player._id} player={player} badgeColor="bg-slate-800 text-slate-400 border-slate-700/60" showResponseLabel={false} />
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-500 py-10 font-bold">All players have responded! 🎉</div>
                  )}
                </React.Fragment>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
};

// Sub-Component for Player List Row
const PlayerListItem = ({ player, badgeColor, showResponseLabel = true }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-panel hover:bg-slate-800/40 rounded-2xl p-3 flex items-center justify-between border border-slate-800/80 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(player.name)} flex items-center justify-center font-bold text-slate-950 text-base shadow`}>
          {getAvatarInitials(player.name)}
        </div>
        <div>
          <div className="text-sm font-extrabold text-white truncate max-w-[150px]">{player.name}</div>
          <div className="text-xs font-semibold text-slate-400">Room {player.roomNumber}</div>
        </div>
      </div>
      
      {showResponseLabel && (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeColor}`}>
          {player.status === 'Playing' ? "I'm In" : "Can't Make It"}
        </span>
      )}
    </motion.div>
  );
};

export default Dashboard;
