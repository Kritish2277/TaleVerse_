const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  depth: { type: Number, default: 0 } // 0 = top-level, 1 = reply
}, { timestamps: true })

module.exports = mongoose.model('Comment', CommentSchema)
