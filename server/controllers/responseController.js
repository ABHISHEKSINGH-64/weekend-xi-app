const Response = require('../models/response');
const Match = require('../models/match');
const User = require('../models/user');

// Helper to get player groups for a specific match
const getPlayerGroups = async (matchId) => {
  const players = await User.find({ role: 'player' }).select('name roomNumber _id');
  const responses = await Response.find({ matchId });

  // Map response userId string to the response object
  const responseMap = {};
  responses.forEach(resp => {
    responseMap[resp.userId.toString()] = resp;
  });

  const playing = [];
  const notComing = [];
  const noResponse = [];

  players.forEach(player => {
    const playerResponse = responseMap[player._id.toString()];
    const playerInfo = {
      _id: player._id,
      name: player.name,
      roomNumber: player.roomNumber
    };

    if (playerResponse) {
      playerInfo.status = playerResponse.status;
      playerInfo.updatedAt = playerResponse.updatedAt;

      if (playerResponse.status === 'Playing') {
        playing.push(playerInfo);
      } else if (playerResponse.status === 'Not Coming') {
        notComing.push(playerInfo);
      } else {
        noResponse.push(playerInfo);
      }
    } else {
      playerInfo.status = 'No Response';
      noResponse.push(playerInfo);
    }
  });

  // Sort lists by name
  const sortByName = (a, b) => a.name.localeCompare(b.name);
  playing.sort(sortByName);
  notComing.sort(sortByName);
  noResponse.sort(sortByName);

  return { playing, notComing, noResponse };
};

// Submit player response
exports.submitResponse = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Playing', 'Not Coming'].includes(status)) {
      return res.status(400).json({ message: 'Valid status ("Playing" or "Not Coming") is required' });
    }

    // Find the active match
    const activeMatch = await Match.findOne({ isActive: true });
    if (!activeMatch) {
      return res.status(404).json({ message: 'No active match scheduled to respond to' });
    }

    // Check if the player has already responded to this match
    const existingResponse = await Response.findOne({
      userId: req.user.id,
      matchId: activeMatch._id
    });

    if (existingResponse) {
      return res.status(400).json({
        message: 'You have already responded to this match. Responses are locked until the match is reset by the admin.'
      });
    }

    // Create a new response
    const newResponse = new Response({
      userId: req.user.id,
      matchId: activeMatch._id,
      status
    });

    await newResponse.save();

    // Fetch the updated player groupings
    const groups = await getPlayerGroups(activeMatch._id);

    // Notify all connected clients of response update
    const io = req.app.get('io');
    if (io) {
      io.emit('response_updated', groups);

      // Also broadcast updated counts for the progress bar
      const totalPlayers = await User.countDocuments({ role: 'player' });
      io.emit('match_updated', {
        match: await Match.findOne({ isActive: true }).populate('createdBy', 'name'),
        stats: {
          totalPlayers,
          playing: groups.playing.length,
          notComing: groups.notComing.length,
          noResponse: groups.noResponse.length
        }
      });
    }

    return res.status(201).json({
      message: 'Response submitted successfully',
      response: newResponse,
      groups
    });

  } catch (error) {
    console.error('Submit Response Error:', error);
    return res.status(500).json({ message: 'Server error submitting response' });
  }
};

// Get players categorized
exports.getPlayers = async (req, res) => {
  try {
    const activeMatch = await Match.findOne({ isActive: true });
    if (!activeMatch) {
      // If there is no active match, return all players as No Response
      const players = await User.find({ role: 'player' }).select('name roomNumber _id').sort({ name: 1 });
      const noResponse = players.map(p => ({
        _id: p._id,
        name: p.name,
        roomNumber: p.roomNumber,
        status: 'No Response'
      }));
      return res.status(200).json({ playing: [], notComing: [], noResponse });
    }

    const groups = await getPlayerGroups(activeMatch._id);
    return res.status(200).json(groups);

  } catch (error) {
    console.error('Get Players Error:', error);
    return res.status(500).json({ message: 'Server error retrieving player response groups' });
  }
};
