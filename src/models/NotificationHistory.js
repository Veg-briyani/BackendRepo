const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationHistorySchema = new Schema({
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  recipientCount: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['admin', 'system', 'payout', 'kyc', 'order', 'author', 'other'],
    default: 'admin'
  },
  data: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('NotificationHistory', NotificationHistorySchema); 