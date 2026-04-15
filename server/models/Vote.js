const mongoose = require('mongoose')

const VoteSchema = new mongoose.Schema({
  contribution: { type: mongoose.Schema.Types.ObjectId, ref: 'Contribution' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  value: { type: Number, enum: [1, -1], default: 1 }
},{ timestamps:true })

module.exports = mongoose.model('Vote', VoteSchema)
