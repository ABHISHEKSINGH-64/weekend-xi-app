const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Generate access code from name and room number:
// First 4 letters of the name (stripping spaces) in uppercase + room number
const generateAccessCode = (name, roomNumber) => {
  if (!name || !roomNumber) return '';
  const cleanName = name.replace(/[^a-zA-Z]/g, '');
  const prefix = cleanName.substring(0, 4).toUpperCase();
  return `${prefix}${roomNumber}`;
};

// Player Login / Auto-Registration
exports.playerLogin = async (req, res) => {
  try {
    const { name, roomNumber, accessCode } = req.body;

    if (!name || !roomNumber || !accessCode) {
      return res.status(400).json({ message: 'Name, room number, and access code are required' });
    }

    // Verify Access Code
    const expectedAccessCode = generateAccessCode(name, roomNumber);
    if (accessCode.trim().toUpperCase() !== expectedAccessCode) {
      return res.status(400).json({ message: 'Invalid Access Code' });
    }

    // Check if room number already exists
    let user = await User.findOne({ roomNumber: roomNumber.trim() });

    if (user) {
      // Room number exists. Check if name matches.
      // We check case-insensitive match for name to be user-friendly, but keep it strict enough
      if (user.name.toLowerCase() !== name.trim().toLowerCase()) {
        return res.status(400).json({
          message: `Room number ${roomNumber} is already registered to a different player.`
        });
      }
      
      // Update name spelling in DB if case matches but character cases differ (optional, let's keep it as is)
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Admin cannot login via player portal.' });
      }
    } else {
      // Room number does not exist, create new player
      user = new User({
        name: name.trim(),
        roomNumber: roomNumber.trim(),
        role: 'player'
      });
      await user.save();
      
      // Emit a socket event if io is bound (we'll set this up in server.js)
      if (req.app.get('io')) {
        req.app.get('io').emit('player_registered', {
          id: user._id,
          name: user.name,
          roomNumber: user.roomNumber
        });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, name: user.name, roomNumber: user.roomNumber, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        roomNumber: user.roomNumber,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Player Login Error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { name, accessCode } = req.body;

    if (!name || !accessCode) {
      return res.status(400).json({ message: 'Admin name and access code are required' });
    }

    const envAdminName = (process.env.ADMIN_NAME || 'Abhishek singh').trim();
    const envAdminCode = (process.env.ADMIN_ACCESS_CODE || 'Abhishek@64').trim();

    // Validate credentials against environment variables (case-insensitive name, case-sensitive password)
    if (name.trim().toLowerCase() !== envAdminName.toLowerCase() || accessCode.trim() !== envAdminCode) {
      return res.status(400).json({ message: 'Invalid Admin Name or Access Code' });
    }

    // Find the Admin user in the database (which must be created on startup)
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      // Create if missing for reference safety
      adminUser = new User({
        name: envAdminName,
        roomNumber: '000',
        role: 'admin'
      });
      await adminUser.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: adminUser._id, name: adminUser.name, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({ message: 'Server error during admin login' });
  }
};

// Get Current User Profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
      id: user._id,
      name: user.name,
      roomNumber: user.roomNumber,
      role: user.role
    });
  } catch (error) {
    console.error('Get User Error:', error);
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};
