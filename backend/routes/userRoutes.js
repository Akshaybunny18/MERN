const express = require('express');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences (Onboarding / Profile)
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  const { areasOfInterest, followedOrganizers } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (areasOfInterest !== undefined) {
        user.preferences.areasOfInterest = areasOfInterest;
      }
      if (followedOrganizers !== undefined) {
        user.preferences.followedOrganizers = followedOrganizers;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        preferences: updatedUser.preferences
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update editable profile fields
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Participant') {
      const { firstName, lastName, college, contactNumber, areasOfInterest, followedOrganizers } = req.body;
      
      if (firstName) user.participantProfile.firstName = firstName;
      if (lastName) user.participantProfile.lastName = lastName;
      if (college) user.participantProfile.college = college;
      if (contactNumber) user.participantProfile.contactNumber = contactNumber;
      
      if (areasOfInterest !== undefined) user.preferences.areasOfInterest = areasOfInterest;
      if (followedOrganizers !== undefined) user.preferences.followedOrganizers = followedOrganizers;
    } else if (user.role === 'Organizer') {
      const { organizerName, category, description, contactEmail, contactNumber } = req.body;
      
      if (organizerName) user.organizerProfile.organizerName = organizerName;
      if (category) user.organizerProfile.category = category;
      if (description !== undefined) user.organizerProfile.description = description;
      if (contactEmail) user.organizerProfile.contactEmail = contactEmail;
      if (contactNumber) user.organizerProfile.contactNumber = contactNumber;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating password' });
  }
});

// ----------------------------------------
// ADMIN ROUTES
// ----------------------------------------

// @route   GET /api/users/admin/organizers
// @desc    Get all organizers
// @access  Admin
router.get('/admin/organizers', protect, admin, async (req, res) => {
  try {
    const organizers = await User.find({ role: 'Organizer' }).select('-password');
    res.json(organizers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch organizers' });
  }
});

// @route   POST /api/users/admin/organizers
// @desc    Create a new organizer
// @access  Admin
router.post('/admin/organizers', protect, admin, async (req, res) => {
  const { email, password, organizerName, category, description, contactEmail, contactNumber } = req.body;
  
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    
    const user = await User.create({
      email,
      password,
      role: 'Organizer',
      organizerProfile: { organizerName, category, description, contactEmail, contactNumber }
    });
    
    res.status(201).json({ _id: user._id, email: user.email, organizerProfile: user.organizerProfile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create organizer' });
  }
});

// @route   PUT /api/users/admin/organizers/:id/toggle-status
// @desc    Disable/Enable organizer
// @access  Admin
router.put('/admin/organizers/:id/toggle-status', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Organizer') return res.status(404).json({ message: 'Organizer not found' });
    
    user.isDisabled = !user.isDisabled;
    await user.save();
    
    res.json({ message: `Organizer ${user.isDisabled ? 'disabled' : 'enabled'}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle status' });
  }
});

// @route   DELETE /api/users/admin/organizers/:id
// @desc    Delete organizer permanently
// @access  Admin
router.delete('/admin/organizers/:id', protect, admin, async (req, res) => {
  try {
    const result = await User.deleteOne({ _id: req.params.id, role: 'Organizer' });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Organizer not found' });
    
    res.json({ message: 'Organizer deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete organizer' });
  }
});

// @route   GET /api/users/admin/reset-requests
// @desc    Get all users who requested a password reset
// @access  Admin
router.get('/admin/reset-requests', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ resetRequest: true }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reset requests' });
  }
});

// @route   POST /api/users/request-reset
// @desc    User requests a password reset
// @access  Public
router.post('/request-reset', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.resetRequest = true;
    await user.save();
    
    res.json({ message: 'Password reset requested successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to request password reset' });
  }
});

module.exports = router;
