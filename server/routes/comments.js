const express = require('express')
const router = express.Router({ mergeParams: true })
const auth = require('../middleware/auth')
const { getComments, addComment, toggleCommentLike } = require('../controllers/commentController')

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return next()
  auth(req, res, next)
}

router.get('/', optionalAuth, getComments)
router.post('/', auth, addComment)
router.post('/:commentId/like', auth, toggleCommentLike)

module.exports = router
