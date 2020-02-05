const mongoose = require('mongoose')

const requestSchema = mongoose.Schema({
  userA: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Profile', // creator
    required: true
  },
  userB: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Profile', // requestor
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Listing',
    required: true
  },
  status: {
    type: Number, // 0 - pending | 1 - accepted | 2 - declined | 3 - withdrawn | 4 - expired
    default: 0,
    required: true
  }
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
