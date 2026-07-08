const express = require('express');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { protect, organizer } = require('../middleware/authMiddleware');

const router = express.Router();

// ----------------------------------------
// ORGANIZER ROUTES
// ----------------------------------------

// @route   POST /api/events
// @desc    Create a draft event
// @access  Organizer
router.post('/', protect, organizer, async (req, res) => {
  try {
    const newEvent = new Event({
      ...req.body,
      organizerId: req.user._id,
      status: 'Draft'
    });
    
    const createdEvent = await newEvent.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event based on state rules
// @access  Organizer
router.put('/:id', protect, organizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Make sure the user owns the event
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to edit this event' });
    }

    const { status, description, registrationDeadline, registrationLimit, customFormStructure, ...otherUpdates } = req.body;

    if (event.status === 'Draft') {
      // Drafts can be freely edited
      Object.assign(event, req.body);
    } else if (event.status === 'Published') {
      // Published: description update, extend deadline, increase limit, close registrations
      if (description) event.description = description;
      
      if (registrationDeadline && new Date(registrationDeadline) > new Date(event.registrationDeadline)) {
        event.registrationDeadline = registrationDeadline;
      }
      
      if (registrationLimit && registrationLimit > event.registrationLimit) {
        event.registrationLimit = registrationLimit;
      }
      
      if (status && ['Closed', 'Ongoing'].includes(status)) {
        event.status = status;
      }
      
      // Check if trying to edit locked fields
      const lockedFieldsAttempt = Object.keys(otherUpdates).length > 0 || (customFormStructure && event.isFormLocked);
      if (lockedFieldsAttempt && !status) { // if status is the only update, that's fine
         return res.status(400).json({ message: 'Cannot edit locked fields of a published event.' });
      }
      
      if (customFormStructure && !event.isFormLocked) {
         event.customFormStructure = customFormStructure;
      }

    } else if (['Ongoing', 'Completed', 'Closed'].includes(event.status)) {
      // Ongoing/Completed: no edits except status change
      if (status && ['Completed', 'Closed'].includes(status)) {
         event.status = status;
      } else if (status) {
         return res.status(400).json({ message: `Cannot change status to ${status} from ${event.status}` });
      } else {
         return res.status(400).json({ message: 'Cannot edit fields of an ongoing or completed event.' });
      }
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
});

// @route   GET /api/events/organizer/my-events
// @desc    Get all events created by the logged-in organizer
// @access  Organizer
router.get('/organizer/my-events', protect, organizer, async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch organizer events' });
  }
});

// @route   GET /api/events/organizer/:id/analytics
// @desc    Get analytics and participants for a specific event
// @access  Organizer
router.get('/organizer/:id/analytics', protect, organizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view this event' });
    }

    const tickets = await Ticket.find({ event: event._id }).populate('user', 'email participantProfile');
    
    res.json({
      event,
      participants: tickets.map(t => ({
        ticketId: t._id,
        email: t.user?.email,
        name: t.user?.participantProfile ? `${t.user.participantProfile.firstName} ${t.user.participantProfile.lastName}` : 'Unknown',
        teamName: t.teamName,
        status: t.status,
        formResponses: t.formResponses,
        purchaseDetails: t.purchaseDetails,
        createdAt: t.createdAt
      })),
      stats: {
        totalRegistrations: tickets.length,
        revenue: tickets.reduce((sum, t) => sum + (t.purchaseDetails?.quantity || 1) * event.registrationFee, 0)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// ----------------------------------------
// PUBLIC ROUTES
// ----------------------------------------


// @route   GET /api/events
// @desc    Get all events with filters, search, and trending
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      type, 
      eligibility, 
      startDate, 
      endDate,
      trending,
      followedOrganizers 
    } = req.query;

    let query = {};

    // 1. Partial & Fuzzy matching on Event Name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
      // Note: Searching by organizer name requires a lookup/join or denormalization.
      // For simplicity in this assignment, we filter by event name.
    }

    // 2. Filters
    if (type) {
      query.eventType = type;
    }
    if (eligibility) {
      query.eligibility = { $regex: eligibility, $options: 'i' };
    }
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }
    if (followedOrganizers) {
      // Expects comma-separated list of organizer IDs
      query.organizerId = { $in: followedOrganizers.split(',') };
    }

    // 3. Trending logic (Top 5 based on ticket count)
    if (trending === 'true') {
      // Find events that have the most tickets
      const topEventsByTickets = await Ticket.aggregate([
        { $group: { _id: '$event', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      
      const trendingEventIds = topEventsByTickets.map(t => t._id);
      
      // If there are trending events, fetch them, else fallback to just newest 5
      if (trendingEventIds.length > 0) {
        query._id = { $in: trendingEventIds };
      }
    }

    const events = await Event.find(query)
      .populate('organizerId', 'organizerProfile.organizerName email')
      .sort(trending === 'true' ? {} : { startDate: 1 })
      .limit(trending === 'true' ? 5 : 0);

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'organizerProfile.organizerName email organizerProfile.description');
      
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
});

module.exports = router;
