const Notification = require('../models/Notification')

// GET /api/notifications  — returns latest 30 for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(30)
    const unreadCount = notifications.filter(n => !n.isRead).length
    res.json({ notifications, unreadCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isRead: true },
      { new: true }
    )
    if (!notification) return res.status(404).json({ error: 'Not found' })
    res.json({ notification })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, isRead: false }, { isRead: true })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// internal helper — called from other controllers
exports.createNotification = async ({ userId, message, type, storyId }) => {
  try {
    await Notification.create({ user: userId, message, type, storyId })
  } catch (err) {
    console.error('[createNotification]', err.message)
  }
}
