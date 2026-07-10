const express = require('express');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('preferences.followedOrganizers', 'organizerProfile.organizerName');
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
// @desc    Delete organizer permanently and cascade delete events and tickets
// @access  Admin
router.delete('/admin/organizers/:id', protect, admin, async (req, res) => {
  try {
    const Event = require('../models/Event');
    const Ticket = require('../models/Ticket');
    
    // Find all events belonging to this organizer
    const events = await Event.find({ organizerId: req.params.id });
    const eventIds = events.map(e => e._id);
    
    // Delete tickets associated with these events
    if (eventIds.length > 0) {
      await Ticket.deleteMany({ event: { $in: eventIds } });
    }
    
    // Delete the events
    await Event.deleteMany({ organizerId: req.params.id });
    
    // Delete the organizer
    const result = await User.deleteOne({ _id: req.params.id, role: 'Organizer' });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Organizer not found' });
    
    res.json({ message: 'Organizer, events, and tickets deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete organizer' });
  }
});

// @route   GET /api/users/admin/reset-requests
// @desc    Get all users who requested a password reset
// @access  Admin
router.get('/admin/reset-requests', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ 'resetRequests.0': { $exists: true } }).select('-password');
    let allRequests = [];
    users.forEach(user => {
      user.resetRequests.forEach(req => {
        allRequests.push({
          userId: user._id,
          email: user.email,
          organizerName: user.organizerProfile?.organizerName,
          request: req
        });
      });
    });
    // Sort by requestedAt descending
    allRequests.sort((a, b) => new Date(b.request.requestedAt) - new Date(a.request.requestedAt));
    res.json(allRequests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reset requests' });
  }
});

// @route   PUT /api/users/admin/reset-requests/:userId/:requestId/resolve
// @desc    Approve or reject a reset request
// @access  Admin
router.put('/admin/reset-requests/:userId/:requestId/resolve', protect, admin, async (req, res) => {
  const { status, adminComment } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const request = user.resetRequests.id(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    request.adminComment = adminComment;
    request.resolvedAt = Date.now();

    let newPassword = null;
    if (status === 'Approved') {
      const crypto = require('crypto');
      newPassword = crypto.randomBytes(4).toString('hex') + 'Aa1!'; // 8 random hex chars + Aa1!
      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();
    
    res.json({ message: `Request ${status}`, newPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to resolve request' });
  }
});

// @route   POST /api/users/request-reset
// @desc    Organizer requests a password reset
// @access  Public
router.post('/request-reset', async (req, res) => {
  const { email, reason } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'Organizer') return res.status(403).json({ message: 'Only Organizers can request password resets' });
    if (!reason) return res.status(400).json({ message: 'Reason is required' });
    
    user.resetRequests.push({ reason });
    await user.save();
    
    res.json({ message: 'Password reset requested successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to request password reset' });
  }
});

module.exports = router;
