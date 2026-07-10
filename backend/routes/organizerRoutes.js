const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/organizers
// @desc    Get all approved organizers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const organizers = await User.find({ role: 'Organizer' })
      .select('email organizerProfile _id');
    res.json(organizers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching organizers' });
  }
});

// @route   GET /api/organizers/:id
// @desc    Get organizer details and their events
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const organizer = await User.findOne({ _id: req.params.id, role: 'Organizer' })
      .select('-password');
      
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Fetch their events
    const currentDate = new Date();
    
    const upcomingEvents = await Event.find({ 
      organizerId: organizer._id,
      startDate: { $gte: currentDate }
    }).sort({ startDate: 1 });

    const pastEvents = await Event.find({ 
      organizerId: organizer._id,
      startDate: { $lt: currentDate }
    }).sort({ startDate: -1 });

    res.json({
      organizer,
      upcomingEvents,
      pastEvents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching organizer details' });
  }
});

// @route   POST /api/organizers/:id/follow
// @desc    Toggle follow status for an organizer
// @access  Private
router.post('/:id/follow', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const organizerId = req.params.id;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trying to follow a valid organizer
    const organizer = await User.findOne({ _id: organizerId, role: 'Organizer' });
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    const isFollowing = user.preferences.followedOrganizers.includes(organizerId);

    if (isFollowing) {
      // Unfollow
      user.preferences.followedOrganizers = user.preferences.followedOrganizers.filter(
        id => id.toString() !== organizerId
      );
    } else {
      // Follow
      user.preferences.followedOrganizers.push(organizerId);
    }

    await user.save();
    
    res.json({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      followedOrganizers: user.preferences.followedOrganizers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while toggling follow status' });
  }
});

module.exports = router;
