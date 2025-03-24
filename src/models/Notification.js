const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: {}
  },
  // For actions taken on notifications
  actioned: {
    type: Boolean,
    default: false
  },
  actionTaken: {
    type: String
  },
  actionData: {
    type: Object
  },
  actionedAt: {
    type: Date
  },
  actionedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Virtual for timeAgo
NotificationSchema.virtual('timeAgo').get(function() {
  const seconds = Math.floor((new Date() - this.createdAt) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + ' years ago';
  if (interval === 1) return interval + ' year ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + ' months ago';
  if (interval === 1) return interval + ' month ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + ' days ago';
  if (interval === 1) return 'yesterday';
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + ' hours ago';
  if (interval === 1) return interval + ' hour ago';
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + ' minutes ago';
  if (interval === 1) return interval + ' minute ago';
  
  return 'just now';
});

// Set toJSON option to include virtuals
NotificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Notification', NotificationSchema);