const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { castVote } = require('../controllers/voteController')

// cast or update vote on a contribution
router.post('/:contributionId', auth, castVote)

module.exports = router
