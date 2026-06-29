import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { matchService, responseService } from '../services/api';
import { getAvatarInitials, getAvatarGradient } from '../utils/avatar';
import GlassCard from '../components/GlassCard';
import EmptyState from '../components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoCalendarOutline, 
  IoLocationOutline, 
  IoTimeOutline, 
  IoMegaphoneOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoAddCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoHelpCircleOutline,
  IoStatsChartOutline,
  IoSaveOutline
} from 'react-icons/io5';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const socket = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  const [match, setMatch] = useState(null);
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState({ playing: [], notComing: [], noResponse: [] });
  const [loading, setLoading] = useState(true);

  // Form states
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [ground, setGround] = useState('');
  const [announcement, setAnnouncement] = useState('');
  
  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const matchRes = await matchService.getActive();
      setMatch(matchRes.match);
      setStats(matchRes.stats);
      
      if (matchRes.match) {
        setDate(matchRes.match.date);
        setTime(matchRes.match.time);
        setGround(matchRes.match.ground);
        setAnnouncement(matchRes.match.announcement || '');
      }

      const playersRes = await responseService.getPlayers();
      setPlayers(playersRes);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
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
      if (data.match) {
        if (!isEditing) {
          setDate(data.match.date);
          setTime(data.match.time);
          setGround(data.match.ground);
        }
        setAnnouncement(data.match.announcement || '');
      }
    });

    socket.on('response_updated', (data) => {
      setPlayers(data);
    });

    socket.on('player_registered', () => {
      fetchData();
    });

    return () => {
      socket.off('match_updated');
      socket.off('response_updated');
      socket.off('player_registered');
    };
  }, [socket, fetchData, isEditing]);

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!date || !time || !ground) {
      showToast('Date, time, and ground location are required', 'error');
      return;
    }

    try {
      setBtnLoading(true);
      const res = await matchService.create({ date, time, ground, announcement });
      setMatch(res.match);
      setIsEditing(false);
      showToast('Match scheduled successfully!', 'success');
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Error creating match';
      showToast(message, 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleEditMatch = async (e) => {
    e.preventDefault();
    if (!date || !time || !ground) {
      showToast('Date, time, and ground location are required', 'error');
      return;
    }

    try {
      setBtnLoading(true);
      await matchService.editActive({ date, time, ground });
      setIsEditing(false);
      showToast('Match details updated successfully!', 'success');
    } catch (error) {
      const message = error.response?.data?.message || 'Error updating match';
      showToast(message, 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteMatch = async () => {
    try {
      setBtnLoading(true);
      await matchService.deleteActive();
      setMatch(null);
      setStats(null);
      setDate('');
      setTime('');
      setGround('');
      setAnnouncement('');
      setShowDeleteConfirm(false);
      showToast('Match cancelled and deleted', 'success');
    } catch (error) {
      const message = error.response?.data?.message || 'Error deleting match';
      showToast(message, 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleUpdateAnnouncement = async () => {
    try {
      setBtnLoading(true);
      await matchService.updateAnnouncement(announcement);
      showToast('Match announcement updated!', 'success');
    } catch (error) {
      const message = error.response?.data?.message || 'Error posting announcement';
      showToast(message, 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleResetResponses = async () => {
    try {
      setBtnLoading(true);
      await matchService.resetResponses();
      setShowResetConfirm(false);
      showToast('All player responses have been reset!', 'success');
    } catch (error) {
      const message = error.response?.data?.message || 'Error resetting responses';
      showToast(message, 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Statistics summaries
  const totalRegistered = stats?.totalPlayers || 0;
  const countPlaying = stats?.playing || 0;
  const countNotComing = stats?.notComing || 0;
  const countWaiting = stats?.noResponse || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8 select-none">
      
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm font-medium">Schedule matches and oversee player rosters</p>
        </div>

        {match && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-xl transition-all duration-200"
            >
              <IoRefreshOutline className="w-4 h-4" />
              Reset Responses
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all duration-200"
            >
              <IoTrashOutline className="w-4 h-4" />
              Cancel Match
            </button>
          </div>
        )}
      </div>

      {/* Live Statistics Cards */}
      {match && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Players" value={totalRegistered} icon={<IoStatsChartOutline className="text-slate-400" />} />
          <StatCard title="Playing" value={countPlaying} icon={<IoCheckmarkCircleOutline className="text-green-400" />} color="text-green-400" />
          <StatCard title="Not Coming" value={countNotComing} icon={<IoCloseCircleOutline className="text-red-400" />} color="text-red-400" />
          <StatCard title="Waiting" value={countWaiting} icon={<IoHelpCircleOutline className="text-slate-400" />} color="text-slate-400" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT/MID SECTION: Manage Match & Announcement Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* MATCH MANAGEMENT */}
          <GlassCard className="border border-slate-700/40">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <IoCalendarOutline className="w-5 h-5 text-green-400" />
                {match ? (isEditing ? 'Edit Match Details' : 'Current Match details') : 'Schedule a Match'}
              </h3>

              {!match ? (
                /* CREATE MATCH FORM */
                <form onSubmit={handleCreateMatch} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Match Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="glass-input"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Match Time</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="glass-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Ground Location</label>
                    <input
                      type="text"
                      placeholder="e.g. PG Ground, Turf Arena, etc."
                      value={ground}
                      onChange={(e) => setGround(e.target.value)}
                      className="glass-input"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Initial Announcement</label>
                    <textarea
                      placeholder="e.g. Bring Bat, Meet at Gate at 6:30 AM"
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                      className="glass-input min-h-[100px] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={btnLoading}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 active:scale-[0.98] transition-all"
                  >
                    <IoAddCircleOutline className="w-5 h-5" />
                    Create Weekend Match
                  </button>
                </form>
              ) : (
                /* CURRENT MATCH VIEWER OR EDIT FORM */
                <div>
                  {isEditing ? (
                    <form onSubmit={handleEditMatch} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Match Date</label>
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="glass-input"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Match Time</label>
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="glass-input"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Ground Location</label>
                        <input
                          type="text"
                          value={ground}
                          onChange={(e) => setGround(e.target.value)}
                          className="glass-input"
                          required
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={btnLoading}
                          className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setDate(match.date);
                            setTime(match.time);
                            setGround(match.ground);
                          }}
                          className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 font-bold rounded-2xl"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-5">
                      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                          <IoLocationOutline className="w-5 h-5 text-green-400" />
                          <div>
                            <span className="text-xs text-slate-400 font-medium block">Ground</span>
                            <span className="text-sm font-bold text-white">{match.ground}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <IoCalendarOutline className="w-5 h-5 text-green-400" />
                          <div>
                            <span className="text-xs text-slate-400 font-medium block">Date</span>
                            <span className="text-sm font-bold text-white">{match.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <IoTimeOutline className="w-5 h-5 text-green-400" />
                          <div>
                            <span className="text-xs text-slate-400 font-medium block">Time</span>
                            <span className="text-sm font-bold text-white">{match.time}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-white font-bold rounded-2xl transition-colors"
                      >
                        Edit Match Details
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          {/* ANNOUNCEMENT MANAGEMENT */}
          {match && (
            <GlassCard className="border border-slate-700/40">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <IoMegaphoneOutline className="w-5 h-5 text-green-400" />
                  Post Match Announcement
                </h3>
                
                <div className="space-y-3">
                  <textarea
                    placeholder="e.g. Bring Bat, Meet at Gate at 6:30 AM"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="glass-input min-h-[110px] resize-none"
                    disabled={btnLoading}
                  />
                  
                  <button
                    onClick={handleUpdateAnnouncement}
                    disabled={btnLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
                  >
                    <IoSaveOutline className="w-4.5 h-4.5" />
                    Save & Broadcast Announcement
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

        </div>

        {/* RIGHT SECTION: Interactive Player Attendance Tables */}
        <div>
          <GlassCard className="border border-slate-700/40 h-full flex flex-col">
            <h3 className="text-lg font-bold text-white tracking-tight mb-4 flex items-center gap-2">
              👥 Attendance Overview
            </h3>

            {/* Custom Responsive Roster Lists */}
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[560px] pr-1">
              
              {/* PLAYING SECTION */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 bg-green-500/5 px-2.5 py-1 rounded border border-green-500/10 inline-block">
                  Playing ({players.playing.length})
                </h4>
                {players.playing.length > 0 ? (
                  players.playing.map(p => (
                    <AdminPlayerRow key={p._id} player={p} badgeColor="bg-green-500/10 text-green-400" />
                  ))
                ) : (
                  <div className="text-[11px] text-slate-500 font-bold py-2 pl-2">No players checked in yet</div>
                )}
              </div>

              {/* NOT COMING SECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/5 px-2.5 py-1 rounded border border-red-500/10 inline-block">
                  Not Coming ({players.notComing.length})
                </h4>
                {players.notComing.length > 0 ? (
                  players.notComing.map(p => (
                    <AdminPlayerRow key={p._id} player={p} badgeColor="bg-red-500/10 text-red-400" />
                  ))
                ) : (
                  <div className="text-[11px] text-slate-500 font-bold py-2 pl-2">No players rejected yet</div>
                )}
              </div>

              {/* WAITING SECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700/60 inline-block">
                  No Response ({players.noResponse.length})
                </h4>
                {players.noResponse.length > 0 ? (
                  players.noResponse.map(p => (
                    <AdminPlayerRow key={p._id} player={p} badgeColor="bg-slate-800 text-slate-400" />
                  ))
                ) : (
                  <div className="text-[11px] text-slate-500 font-bold py-2 pl-2">All players responded!</div>
                )}
              </div>

            </div>
          </GlassCard>
        </div>

      </div>

      {/* 4. CONFIRMATION DIALOG MODALS */}
      {/* Delete/Cancel Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-panel max-w-sm w-full p-6 rounded-3xl space-y-6 border border-red-500/20"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-400 mb-2">
                  <IoTrashOutline className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Cancel Match?</h3>
                <p className="text-xs font-medium text-slate-400">
                  This will permanently delete the current weekend match, clearing all player responses.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteMatch}
                  disabled={btnLoading}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 font-extrabold text-slate-950 text-sm rounded-xl transition-colors"
                >
                  Yes, Cancel Match
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={btnLoading}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-colors"
                >
                  Keep Match
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-panel max-w-sm w-full p-6 rounded-3xl space-y-6 border border-yellow-500/20"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-yellow-500/10 text-yellow-500 mb-2">
                  <IoRefreshOutline className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Reset Responses?</h3>
                <p className="text-xs font-medium text-slate-400">
                  This will clear all player check-ins. Every player will return to 'Waiting' status and can vote again.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleResetResponses}
                  disabled={btnLoading}
                  className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 font-extrabold text-slate-950 text-sm rounded-xl transition-colors"
                >
                  Yes, Reset All
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={btnLoading}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Sub-Component: Live Statistics Cards
const StatCard = ({ title, value, icon, color = 'text-white' }) => {
  return (
    <GlassCard className="p-4 border border-slate-800/80 flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <span className={`text-2xl font-black block ${color}`}>{value}</span>
      </div>
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
        {icon}
      </div>
    </GlassCard>
  );
};

// Sub-Component: Roster List Row
const AdminPlayerRow = ({ player, badgeColor }) => {
  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded-xl">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(player.name)} flex items-center justify-center font-bold text-slate-950 text-sm shadow`}>
          {getAvatarInitials(player.name)}
        </div>
        <div>
          <span className="text-xs font-bold text-white block max-w-[120px] truncate">{player.name}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Room {player.roomNumber}</span>
        </div>
      </div>
      
      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
        {player.status === 'Playing' ? 'IN' : player.status === 'Not Coming' ? 'OUT' : 'WAITING'}
      </span>
    </div>
  );
};

export default AdminDashboard;
