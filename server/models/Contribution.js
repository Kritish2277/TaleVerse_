const mongoose = require('mongoose')

const ContributionSchema = new mongoose.Schema({
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vote' }],
  accepted: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
},{ timestamps:true })

module.exports = mongoose.model('Contribution', ContributionSchema)
