const Match = require('../models/match');
const Response = require('../models/response');
const User = require('../models/user');

// Get Active Match and current response stats
exports.getActiveMatch = async (req, res) => {
  try {
    const match = await Match.findOne({ isActive: true }).populate('createdBy', 'name');

    if (!match) {
      return res.status(200).json({ match: null, stats: null });
    }

    // Calculate response counts for the active match
    const totalPlayers = await User.countDocuments({ role: 'player' });
    const playingCount = await Response.countDocuments({ matchId: match._id, status: 'Playing' });
    const notComingCount = await Response.countDocuments({ matchId: match._id, status: 'Not Coming' });
    const noResponseCount = Math.max(0, totalPlayers - playingCount - notComingCount);

    return res.status(200).json({
      match,
      stats: {
        totalPlayers,
        playing: playingCount,
        notComing: notComingCount,
        noResponse: noResponseCount
      }
    });
  } catch (error) {
    console.error('Get Active Match Error:', error);
    return res.status(500).json({ message: 'Server error retrieving match' });
  }
};

// Create a new Match (Admin only)
exports.createMatch = async (req, res) => {
  try {
    const { date, time, ground, announcement } = req.body;

    if (!date || !time || !ground) {
      return res.status(400).json({ message: 'Date, time, and ground are required' });
    }

    // Set all previous active matches to inactive
    await Match.updateMany({ isActive: true }, { isActive: false });

    // Create the new match
    const newMatch = new Match({
      date,
      time,
      ground,
      announcement: announcement || '',
      isActive: true,
      createdBy: req.user.id
    });

    await newMatch.save();

    // Populate createdBy
    await newMatch.populate('createdBy', 'name');

    // Notify all clients of new match via socket
    const io = req.app.get('io');
    if (io) {
      const totalPlayers = await User.countDocuments({ role: 'player' });
      io.emit('match_updated', {
        match: newMatch,
        stats: {
          totalPlayers,
          playing: 0,
          notComing: 0,
          noResponse: totalPlayers
        }
      });
    }

    return res.status(201).json({
      message: 'Match scheduled successfully',
      match: newMatch
    });
  } catch (error) {
    console.error('Create Match Error:', error);
    return res.status(500).json({ message: 'Server error creating match' });
  }
};

// Edit Active Match (Admin only)
exports.editActiveMatch = async (req, res) => {
  try {
    const { date, time, ground } = req.body;

    if (!date || !time || !ground) {
      return res.status(400).json({ message: 'Date, time, and ground are required' });
    }

    const match = await Match.findOne({ isActive: true });
    if (!match) {
      return res.status(404).json({ message: 'No active match found to edit' });
    }

    match.date = date;
    match.time = time;
    match.ground = ground;
    await match.save();

    await match.populate('createdBy', 'name');

    // Retrieve stats to broadcast updated details
    const totalPlayers = await User.countDocuments({ role: 'player' });
    const playingCount = await Response.countDocuments({ matchId: match._id, status: 'Playing' });
    const notComingCount = await Response.countDocuments({ matchId: match._id, status: 'Not Coming' });
    const noResponseCount = Math.max(0, totalPlayers - playingCount - notComingCount);

    const io = req.app.get('io');
    if (io) {
      io.emit('match_updated', {
        match,
        stats: {
          totalPlayers,
          playing: playingCount,
          notComing: notComingCount,
          noResponse: noResponseCount
        }
      });
    }

    return res.status(200).json({
      message: 'Match updated successfully',
      match
    });
  } catch (error) {
    console.error('Edit Match Error:', error);
    return res.status(500).json({ message: 'Server error updating match' });
  }
};

// Delete Active Match (Admin only)
exports.deleteActiveMatch = async (req, res) => {
  try {
    const match = await Match.findOne({ isActive: true });
    if (!match) {
      return res.status(404).json({ message: 'No active match found to delete' });
    }

    // Delete all responses for this match
    await Response.deleteMany({ matchId: match._id });
    
    // Delete the match itself
    await Match.findByIdAndDelete(match._id);

    // Notify sockets
    const io = req.app.get('io');
    if (io) {
      io.emit('match_updated', { match: null, stats: null });
    }

    return res.status(200).json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Delete Match Error:', error);
    return res.status(500).json({ message: 'Server error deleting match' });
  }
};

// Update Announcement (Admin only)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { announcement } = req.body;

    const match = await Match.findOne({ isActive: true });
    if (!match) {
      return res.status(404).json({ message: 'No active match scheduled to post announcements' });
    }

    match.announcement = announcement || '';
    await match.save();

    await match.populate('createdBy', 'name');

    const totalPlayers = await User.countDocuments({ role: 'player' });
    const playingCount = await Response.countDocuments({ matchId: match._id, status: 'Playing' });
    const notComingCount = await Response.countDocuments({ matchId: match._id, status: 'Not Coming' });
    const noResponseCount = Math.max(0, totalPlayers - playingCount - notComingCount);

    const io = req.app.get('io');
    if (io) {
      io.emit('match_updated', {
        match,
        stats: {
          totalPlayers,
          playing: playingCount,
          notComing: notComingCount,
          noResponse: noResponseCount
        }
      });
    }

    return res.status(200).json({
      message: 'Announcement updated successfully',
      match
    });
  } catch (error) {
    console.error('Update Announcement Error:', error);
    return res.status(500).json({ message: 'Server error updating announcement' });
  }
};

// Reset all responses for active match (Admin only)
exports.resetResponses = async (req, res) => {
  try {
    const match = await Match.findOne({ isActive: true });
    if (!match) {
      return res.status(404).json({ message: 'No active match found to reset' });
    }

    // Delete all responses for the active match
    await Response.deleteMany({ matchId: match._id });

    // Notify sockets
    const totalPlayers = await User.countDocuments({ role: 'player' });
    const io = req.app.get('io');
    if (io) {
      io.emit('response_updated', {
        playing: [],
        notComing: [],
        noResponse: await User.find({ role: 'player' }).select('name roomNumber _id')
      });
      // Also emit match updated with reset stats
      await match.populate('createdBy', 'name');
      io.emit('match_updated', {
        match,
        stats: {
          totalPlayers,
          playing: 0,
          notComing: 0,
          noResponse: totalPlayers
        }
      });
    }

    return res.status(200).json({ message: 'All responses have been reset successfully' });
  } catch (error) {
    console.error('Reset Responses Error:', error);
    return res.status(500).json({ message: 'Server error resetting responses' });
  }
};
