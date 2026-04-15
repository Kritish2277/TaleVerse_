const Comment = require('../models/Comment')

// GET /api/stories/:storyId/comments
exports.getComments = async (req, res) => {
  try {
    const { storyId } = req.params
    const comments = await Comment.find({ story: storyId })
      .populate('author', 'displayName avatarSeed avatarStyle')
      .sort({ createdAt: 1 })

    // attach per-user like state
    const userId = req.userId || null
    const result = comments.map(c => {
      const obj = c.toObject()
      return {
        ...obj,
        likedByMe: userId
          ? (obj.likes || []).some(id => String(id) === String(userId))
          : false
      }
    })

    res.json({ comments: result })
  } catch (err) {
    console.error('[getComments]', err)
    res.status(500).json({ error: err.message })
  }
}

// POST /api/stories/:storyId/comments
exports.addComment = async (req, res) => {
  try {
    const { storyId } = req.params
    const { content, parentCommentId } = req.body

    if (!content?.trim()) return res.status(400).json({ error: 'Content required' })

    let depth = 0
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId)
      if (!parent) return res.status(404).json({ error: 'Parent comment not found' })
      if (parent.depth >= 1) return res.status(400).json({ error: 'Max reply depth reached' })
      depth = parent.depth + 1
    }

    const comment = await Comment.create({
      story: storyId,
      author: req.userId,
      content: content.trim(),
      parentComment: parentCommentId || null,
      depth
    })
    await comment.populate('author', 'displayName avatarSeed avatarStyle')

    console.log(`[addComment] story=${storyId} author=${req.userId} comment=${comment._id}`)

    const io = req.app?.get('io')
    if (io) io.to(`story_${storyId}`).emit('comment:added', comment)

    res.status(201).json({ comment })
  } catch (err) {
    console.error('[addComment]', err)
    res.status(500).json({ error: err.message })
  }
}

// POST /api/comments/:commentId/like
exports.toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params
    const userId = req.userId

    const comment = await Comment.findById(commentId)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })

    const idx = comment.likes.findIndex(id => String(id) === String(userId))
    if (idx === -1) {
      comment.likes.push(userId)
    } else {
      comment.likes.splice(idx, 1)
    }
    await comment.save()

    console.log(`[toggleCommentLike] comment=${commentId} user=${userId} liked=${idx === -1} total=${comment.likes.length}`)
    res.json({ liked: idx === -1, likeCount: comment.likes.length })
  } catch (err) {
    console.error('[toggleCommentLike]', err)
    res.status(500).json({ error: err.message })
  }
}
