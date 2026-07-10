const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new participant
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, participantType, firstName, lastName, college, contactNumber } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Account with this email already exists. Please log in.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate IIIT Email
    if (participantType === 'IIIT') {
      if (!(email.endsWith('@iiit.ac.in') || email.endsWith('@students.iiit.ac.in') || email.endsWith('@research.iiit.ac.in'))) {
        return res.status(400).json({ message: 'IIIT Participants must use an @iiit.ac.in, @students.iiit.ac.in, or @research.iiit.ac.in email address' });
      }
    } else if (participantType !== 'Non-IIIT') {
      return res.status(400).json({ message: 'Invalid participant type' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: 'Participant',
      participantProfile: {
        firstName,
        lastName,
        participantType,
        college,
        contactNumber
      }
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
