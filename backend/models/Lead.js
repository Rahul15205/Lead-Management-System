const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: {
      values: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'],
      message: 'Source must be one of: website, facebook_ads, google_ads, referral, events, other'
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['new', 'contacted', 'qualified', 'lost', 'won'],
      message: 'Status must be one of: new, contacted, qualified, lost, won'
    },
    default: 'new'
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score must be between 0 and 100'],
    max: [100, 'Score must be between 0 and 100']
  },
  lead_value: {
    type: Number,
    required: [true, 'Lead value is required'],
    min: [0, 'Lead value must be positive']
  },
  last_activity_at: {
    type: Date,
    default: null
  },
  is_qualified: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for better query performance
leadSchema.index({ user: 1, email: 1 });
leadSchema.index({ user: 1, status: 1 });
leadSchema.index({ user: 1, source: 1 });
leadSchema.index({ user: 1, created_at: -1 });

module.exports = mongoose.model('Lead', leadSchema);
