const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  // 'password' stores the bcrypt hash; alias kept as passwordHash for legacy compat
  password: { type: String },
  passwordHash: { type: String },
  // 'name' is the canonical field; displayName is kept for legacy compat
  name: { type: String },
  displayName: { type: String },
  points: { type: Number, default: 0 },
  avatar: { type: String, default: 'avatar1.png' }, // default avatar filename
  avatarSeed: { type: String }, // seed for DiceBear avatar generation
  avatarStyle: { type: String, default: 'adventurer' }, // DiceBear avatar style
  // preferences for UI and notifications
  language: { type: String, default: 'en' },
  theme: { type: String, default: 'light' },
  notifications: {
    storyUpdates: { type: Boolean, default: true },
    newContributions: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true }
  }
},{ timestamps:true })

// Keep name ↔ displayName in sync so both fields always work
UserSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.displayName) this.displayName = this.name
  if (this.isModified('displayName') && !this.name) this.name = this.displayName
  if (this.isModified('password') && !this.passwordHash) this.passwordHash = this.password
  if (this.isModified('passwordHash') && !this.password) this.password = this.passwordHash
  next()
})

module.exports = mongoose.model('User', UserSchema)

