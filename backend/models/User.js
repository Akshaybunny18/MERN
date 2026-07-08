const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Participant', 'Organizer', 'Admin'],
    default: 'Participant'
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  resetRequest: {
    type: Boolean,
    default: false
  },
  // Participant-specific fields (Required if role === 'Participant')
  participantProfile: {
    firstName: { type: String },
    lastName: { type: String },
    participantType: {
      type: String,
      enum: ['IIIT', 'Non-IIIT', 'N/A'],
      default: 'N/A'
    },
    college: { type: String },
    contactNumber: { type: String }
  },
  // Organizer-specific fields (Required if role === 'Organizer')
  organizerProfile: {
    organizerName: { type: String },
    category: { type: String },
    description: { type: String },
    contactEmail: { type: String },
    contactNumber: { type: String }
  },
  // Preferences (Section 5)
  preferences: {
    areasOfInterest: [{ type: String }],
    followedOrganizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
