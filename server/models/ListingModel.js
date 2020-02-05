const mongoose = require('mongoose')

const listingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Profile',
    required: true
  },
  activity: {
    type: String,
    required: true,
    trim: true
  },
  date_time: {
    type: Date,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  location_name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  type: {
    type: Number, // 0 - open | 1 - private | 2 - friends only
    required: true
  },
  status: {
    type: Number, // 0 - open | 1 - full | 2 - expired
    default: 0,
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Profile'
  }],
  maxMembers: {
    type: Number,
    min: 2,
    required: true
  },
  requests: [{
    _id: false,
    user: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Profile'
     },
    status: {
      type: Number, // 0 - pending | 1 - accepted | 2 - declined | 3 - withdrawn | 4 - expired
      default: 0
    }
  }]
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
