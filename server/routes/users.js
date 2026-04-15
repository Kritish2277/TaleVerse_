const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  getProfile,
  updateProfile,
  updatePreferences,
  getStats,
  changePassword,
  deleteAccount
} = require('../controllers/userController')

router.get('/me', auth, getProfile)
router.put('/me', auth, updateProfile)

// preferences
router.put('/me/preferences', auth, updatePreferences)
// stats
router.get('/me/stats', auth, getStats)
// security actions
router.put('/me/password', auth, changePassword)
router.delete('/me', auth, deleteAccount)

module.exports = router
