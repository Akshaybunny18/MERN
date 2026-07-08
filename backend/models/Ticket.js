const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  type: {
    type: String,
    enum: ['Normal', 'Merchandise'],
    required: true
  },
  status: {
    type: String,
    enum: ['Registered', 'Completed', 'Cancelled', 'Rejected'],
    default: 'Registered'
  },
  teamName: {
    type: String
  },
  // If it's a merchandise purchase, store the selected variant details
  purchaseDetails: {
    size: String,
    color: String,
    quantity: {
      type: Number,
      default: 1
    }
  },
  // Normal event custom form responses
  formResponses: {
    type: Map,
    of: String
  },
  qrCodeData: {
    type: String // base64 data URI of the QR code
  }
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
