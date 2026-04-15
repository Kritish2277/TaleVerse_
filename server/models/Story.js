const mongoose = require('mongoose')

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  contributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contribution' }],
  contributors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  meta: { type: Object }
},{ timestamps:true })

module.exports = mongoose.model('Story', StorySchema)
