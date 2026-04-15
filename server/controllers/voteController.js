const Vote = require('../models/Vote')
const Contribution = require('../models/Contribution')
const User = require('../models/User')

exports.castVote = async (req,res)=>{
  try{
    const contributionId = req.params.contributionId
    const { value } = req.body
    const userId = req.userId
    if(![1,-1].includes(value)) return res.status(400).json({error:'Invalid vote value'})

    // ensure contribution exists
    const contribution = await Contribution.findById(contributionId)
    if(!contribution) return res.status(404).json({error:'Contribution not found'})

    // find existing vote by this user
    let vote = await Vote.findOne({contribution:contributionId, user:userId})
    let delta = value
    if(vote){
      // compute delta between new and old value
      delta = value - vote.value
      vote.value = value
      await vote.save()
    }else{
      vote = await Vote.create({contribution:contributionId, user:userId, value})
      // attach vote to contribution
      contribution.votes = contribution.votes || []
      contribution.votes.push(vote._id)
      await contribution.save()
    }

    // apply delta to the contribution author's points
    if(contribution.author){
      await User.findByIdAndUpdate(contribution.author, {$inc: {points: delta}})
      // emit vote update to story room
      const io = req.app && req.app.get && req.app.get('io')
      if(io){
        io.to(`story_${contribution.story}`).emit('vote:updated', {contribution: contributionId, delta})
      }
    }

    res.json({vote})
  }catch(err){res.status(500).json({error:err.message})}
}
