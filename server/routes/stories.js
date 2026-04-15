const express = require('express')
const router = express.Router()

const {
  createStory,
  getStories,
  getStory,
  publishStory,
  toggleStoryLike,
  completeStory
} = require('../controllers/storyController')

const auth = require('../middleware/auth')

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return next()
  auth(req, res, next)
}

router.get('/', optionalAuth, getStories)
router.post('/', auth, createStory)

router.patch('/:storyId/complete', auth, completeStory) // 🔥 BEFORE dynamic
router.post('/:storyId/publish', auth, publishStory)
router.post('/:storyId/like', auth, toggleStoryLike)

router.get('/:storyId', optionalAuth, getStory) // 🔥 LAST

module.exports = router