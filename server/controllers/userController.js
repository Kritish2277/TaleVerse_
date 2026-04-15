const User = require('../models/User')
const Story = require('../models/Story')
const Contribution = require('../models/Contribution')

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash -password')
    if (!user) return res.status(404).json({ error: 'User not found' })

    const [stories, contributions] = await Promise.all([
      Story.countDocuments({ author: req.userId }),
      Contribution.countDocuments({ author: req.userId })
    ])

    const points = (stories * 10) + (contributions * 5)

    res.json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        avatarSeed: user.avatarSeed,
        avatarStyle: user.avatarStyle,
        points: user.points ?? 0,
        createdAt: user.createdAt
      },
      stats: { stories, contributions, points }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateProfile = async (req,res)=>{
  try{
    const updates = {}
    if(req.body.displayName) updates.displayName = req.body.displayName
    if(typeof req.body.points === 'number') updates.points = req.body.points
    // allow avatar changes via general profile update
    if(req.body.avatar !== undefined) updates.avatar = req.body.avatar
    if(req.body.avatarStyle) updates.avatarStyle = req.body.avatarStyle
    const user = await User.findByIdAndUpdate(req.userId, updates, {new:true}).select('-passwordHash')
    res.json({user})
  }catch(err){res.status(500).json({error:err.message})}
}

// new: update preferences endpoint
exports.updatePreferences = async (req,res)=>{
  try{
    const updates = {}
    const { language, theme, avatar, notifications } = req.body
    if(language) updates.language = language
    if(theme) updates.theme = theme
    if(avatar !== undefined) updates.avatar = avatar
    if(notifications) updates.notifications = {
      ...notifications
    }
    const user = await User.findByIdAndUpdate(req.userId, updates, {new:true}).select('-passwordHash')
    res.json({user})
  }catch(err){res.status(500).json({error:err.message})}
}

// stats endpoint
exports.getStats = async (req, res) => {
  try {
    const [stories, contributions] = await Promise.all([
      Story.countDocuments({ author: req.userId }),
      Contribution.countDocuments({ author: req.userId })
    ])
    const points = (stories * 10) + (contributions * 5)
    res.json({ stories, contributions, points })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// new: change password
exports.changePassword = async (req,res)=>{
  try{
    const { currentPassword, newPassword } = req.body
    if(!currentPassword || !newPassword) return res.status(400).json({error:'Missing parameters'})
    const user = await User.findById(req.userId)
    if(!user) return res.status(404).json({error:'User not found'})
    const bcrypt = require('bcryptjs')
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if(!valid) return res.status(400).json({error:'Incorrect current password'})
    user.passwordHash = await bcrypt.hash(newPassword, 10)
    await user.save()
    res.json({message:'Password updated'})
  }catch(err){res.status(500).json({error:err.message})}
}

// new: delete account
exports.deleteAccount = async (req,res)=>{
  try{
    await User.findByIdAndDelete(req.userId)
    res.json({message:'Account deleted'})
  }catch(err){res.status(500).json({error:err.message})}
}

