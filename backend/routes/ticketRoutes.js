const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper to create test Ethereal email account on the fly
let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return process.exit(1);
  }
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
});

// @route   POST /api/tickets/register/:eventId
// @desc    Register for an event or purchase merchandise
// @access  Private
router.post('/register/:eventId', protect, async (req, res) => {
  try {
    const { teamName, purchaseDetails, formResponses } = req.body;
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!['Published', 'Ongoing'].includes(event.status)) {
      return res.status(400).json({ message: `Cannot register for an event that is ${event.status}` });
    }

    // 1. Validations
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    if (event.eligibility === 'IIITH Students only' && !req.user.email.endsWith('@iiit.ac.in')) {
      return res.status(403).json({ message: 'Only IIITH students can register for this event.' });
    }

    // Check existing registration
    const existingTicket = await Ticket.findOne({ user: req.user._id, event: event._id });
    if (existingTicket && event.eventType === 'Normal') {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Merch constraints
    if (event.eventType === 'Merchandise') {
      if (event.merchDetails.stockQuantity <= 0) {
        return res.status(400).json({ message: 'Item is out of stock' });
      }
      const requestedQty = purchaseDetails?.quantity || 1;
      if (requestedQty > event.merchDetails.purchaseLimit) {
        return res.status(400).json({ message: `Cannot purchase more than ${event.merchDetails.purchaseLimit} items` });
      }
      
      // Decrement stock
      event.merchDetails.stockQuantity -= requestedQty;
      await event.save();
    } else {
      // Normal event limits
      if (event.registrationLimit) {
        const ticketCount = await Ticket.countDocuments({ event: event._id });
        if (ticketCount >= event.registrationLimit) {
          return res.status(400).json({ message: 'Event registration is full' });
        }
      }
    }

    // 2. Generate Ticket Data
    const ticketId = 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Generate QR Code data URI
    const qrData = JSON.stringify({ ticketId, eventId: event._id, userId: req.user._id });
    const qrCodeData = await QRCode.toDataURL(qrData);

    // 3. Save Ticket
    const ticket = await Ticket.create({
      ticketId,
      user: req.user._id,
      event: event._id,
      type: event.eventType,
      teamName,
      purchaseDetails,
      formResponses,
      qrCodeData,
      status: 'Registered'
    });

    // Lock the event form so it can't be edited anymore
    if (!event.isFormLocked) {
      event.isFormLocked = true;
      await event.save();
    }

    // 4. Send Email using Nodemailer (Ethereal)
    if (transporter) {
      let info = await transporter.sendMail({
        from: '"Event System" <noreply@eventsystem.local>',
        to: req.user.email,
        subject: `Ticket Confirmation: ${event.name}`,
        html: `
          <h1>Registration Confirmed</h1>
          <p>You have successfully registered for <b>${event.name}</b>.</p>
          <p>Your Ticket ID is: <b>${ticketId}</b></p>
          <img src="${qrCodeData}" alt="QR Code" />
          <p>Keep this QR code safe for entry.</p>
        `,
      });
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   GET /api/tickets/my-tickets
// @desc    Get user's tickets/history
// @access  Private
router.get('/my-tickets', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('event', 'name eventType startDate endDate organizerId')
      .populate({
        path: 'event',
        populate: { path: 'organizerId', select: 'organizerProfile.organizerName' }
      })
      .sort({ createdAt: -1 });
      
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching tickets' });
  }
});

module.exports = router;
