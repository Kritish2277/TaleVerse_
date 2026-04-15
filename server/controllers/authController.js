const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const SECRET = () => process.env.JWT_SECRET || 'devsecret'
const signToken = (id) => jwt.sign({ id }, SECRET(), { expiresIn: '7d' })

exports.register = async (req, res) => {
  try {
    const { email, password, name, displayName } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const resolvedName = name || displayName || email.split('@')[0]
    const avatarSeed = Math.random().toString(36).substring(2, 10)

    const user = await User.create({
      email,
      password: hash,
      passwordHash: hash,
      name: resolvedName,
      displayName: resolvedName,
      avatarSeed
    })

    const token = signToken(user._id)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        avatarSeed: user.avatarSeed
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    // support both field names — older documents may only have passwordHash
    const storedHash = user.passwordHash || user.password
    if (!storedHash) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, storedHash)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user._id) // uses shared helper — includes 7d expiry

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        avatarSeed: user.avatarSeed,
        avatarStyle: user.avatarStyle,
        points: user.points ?? 0
      }
    })
  } catch (err) {
    console.error('[login error]', err)
    res.status(500).json({ error: err.message })
  }
}
