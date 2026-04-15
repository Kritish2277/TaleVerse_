const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const storyRoutes = require('./routes/stories')
const contributionRoutes = require('./routes/contributions')
const voteRoutes = require('./routes/votes')

const app = express()
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      process.env.CLIENT_URL
    ].filter(Boolean)

    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json())

// basic health
app.get('/', (req,res)=> res.json({ok:true, name:'TaleVerse API'}))

// routes
app.use('/api/auth', authRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/stories/:storyId/contributions', contributionRoutes)

const commentRoutes = require('./routes/comments')
app.use('/api/stories/:storyId/comments', commentRoutes)

// standalone comment like (called directly by client)
const commentController = require('./controllers/commentController')
const authMiddleware = require('./middleware/auth')
app.post('/api/comments/:commentId/like', authMiddleware, commentController.toggleCommentLike)

app.use('/api/votes', voteRoutes)

const userRoutes = require('./routes/users')
app.use('/api/users', userRoutes)

const leaderboardRoutes = require('./routes/leaderboard')
app.use('/api/leaderboard', leaderboardRoutes)

const notificationRoutes = require('./routes/notifications')
app.use('/api/notifications', notificationRoutes)

module.exports = app
