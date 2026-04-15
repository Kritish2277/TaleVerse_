const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
let User

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const match = authHeader.match(/^Bearer (.+)$/)
    if (!match) return res.status(401).json({ error: 'No token' })

    const token = match[1]
    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    } catch {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.userId = payload.id
    // req.user.id mirrors req.userId for convenience
    req.user = { id: payload.id }

    // Enrich req.user with DB data when Mongo is available
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      if (!User) User = require('../models/User')
      const dbUser = await User.findById(req.userId).select('name displayName email points')
      if (dbUser) req.user = { ...req.user, ...dbUser.toObject() }
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
