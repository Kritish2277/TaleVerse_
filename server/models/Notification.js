const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['accepted', 'rejected', 'new_contribution'], required: true },
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
  isRead:  { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Notification', NotificationSchema)
