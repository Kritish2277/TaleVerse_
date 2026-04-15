const express = require('express')
const router = express.Router({ mergeParams: true })
const auth = require('../middleware/auth')
const { addContribution, getContributions, updateContributionStatus } = require('../controllers/contributionController')

router.get('/', auth, getContributions)
router.post('/', auth, addContribution)
router.patch('/:contributionId/status', auth, updateContributionStatus)

module.exports = router
