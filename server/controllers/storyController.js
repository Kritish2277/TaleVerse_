const Story = require('../models/Story')
const Comment = require('../models/Comment')

exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find().limit(50).populate('author', 'displayName avatar avatarSeed avatarStyle')

    // aggregate comment counts in one query
    const ids = stories.map(s => s._id)
    const counts = await Comment.aggregate([
      { $match: { story: { $in: ids } } },
      { $group: { _id: '$story', count: { $sum: 1 } } }
    ])
    const countMap = {}
    counts.forEach(c => { countMap[String(c._id)] = c.count })

    // determine per-user like state when authenticated
    const userId = req.userId || null

    const result = stories.map(s => {
      const obj = s.toObject()
      return {
        ...obj,
        likeCount: obj.likes?.length || 0,
        commentsCount: countMap[String(s._id)] || 0,
        likedByMe: userId
          ? (obj.likes || []).some(id => String(id) === String(userId))
          : false
      }
    })

    res.json({ stories: result })
  } catch (err) {
    console.error('[getStories]', err)
    res.status(500).json({ error: err.message })
  }
}

exports.getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId)
      .populate('author', 'displayName avatarSeed avatarStyle avatar')
      .populate('contributors', 'displayName avatar avatarSeed avatarStyle')
    if (!story) return res.status(404).json({ error: 'Not found' })

    const commentsCount = await Comment.countDocuments({ story: story._id })
    const userId = req.userId || null
    const obj = story.toObject()

    res.json({
      story: {
        ...obj,
        likeCount: obj.likes?.length || 0,
        commentsCount,
        likedByMe: userId
          ? (obj.likes || []).some(id => String(id) === String(userId))
          : false
      }
    })
  } catch (err) {
    console.error('[getStory]', err)
    res.status(500).json({ error: err.message })
  }
}

exports.toggleStoryLike = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId)
    if (!story) return res.status(404).json({ error: 'Not found' })

    const userId = req.userId
    const idx = story.likes.findIndex(id => String(id) === String(userId))
    if (idx === -1) {
      story.likes.push(userId)
    } else {
      story.likes.splice(idx, 1)
    }
    await story.save({ validateBeforeSave: false })

    console.log(`[toggleStoryLike] story=${story._id} user=${userId} liked=${idx === -1} total=${story.likes.length}`)
    res.json({ liked: idx === -1, likeCount: story.likes.length })
  } catch (err) {
    console.error('[toggleStoryLike]', err)
    res.status(500).json({ error: err.message })
  }
}

exports.createStory = async (req, res) => {
  try {
    const { title, content, genre } = req.body
    const authorId = req.userId || null
    const story = await Story.create({
      title,
      author: authorId,
      content,
      genre
    })
    console.log(`[createStory] created story=${story._id} author=${authorId}`)
    res.json({ story })
  } catch (err) {
    console.error('[createStory]', err)
    res.status(500).json({ error: err.message })
  }
}

exports.publishStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId)
    if (!story) return res.status(404).json({ error: 'Story not found' })
    if (String(story.author) !== String(req.userId)) {
      return res.status(403).json({ error: 'Only author can publish' })
    }
    story.isPublished = true
    await story.save()
    res.json({ story })
  } catch (err) {
    console.error('[publishStory]', err)
    res.status(500).json({ error: err.message })
  }
}

exports.completeStory = async (req, res) => {
  try {
    const { storyId } = req.params

    const story = await Story.findById(storyId)
    if (!story) return res.status(404).json({ error: 'Story not found' })

    // only author can complete
    if (String(story.author) !== String(req.userId)) {
      return res.status(403).json({ error: 'Only author can complete the story' })
    }

    story.isCompleted = true
    await story.save()

    res.json({ message: 'Story marked as completed', story })

  } catch (err) {
    console.error('[completeStory]', err)
    res.status(500).json({ error: err.message })
  }
}
