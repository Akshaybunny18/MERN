const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['Normal', 'Merchandise'],
    required: true
  },
  eligibility: {
    type: String
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationLimit: {
    type: Number
  },
  registrationFee: {
    type: Number,
    default: 0
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Closed'],
    default: 'Draft'
  },
  isFormLocked: {
    type: Boolean,
    default: false
  },
  // Normal Event specific
  customFormStructure: [{
    fieldName: String,
    fieldType: {
      type: String,
      enum: ['text', 'textarea', 'select', 'checkbox', 'radio']
    },
    options: [String], // for select/radio/checkbox
    required: Boolean
  }],
  // Merchandise Event specific
  merchDetails: {
    variants: [{
      size: String,
      color: String,
      sku: String
    }],
    stockQuantity: {
      type: Number
    },
    purchaseLimit: {
      type: Number
    }
  }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
