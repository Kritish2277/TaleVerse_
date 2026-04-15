const Contribution = require('../models/Contribution')
const Story = require('../models/Story')
const { createNotification } = require('./notificationController')

exports.addContribution = async (req, res) => {
  try {
    const storyId = req.params.storyId
    const { content } = req.body
    const authorId = req.userId
    if (!content) return res.status(400).json({ error: 'Content required' })

    // auto-accept if the submitter is the story author
    const story = await Story.findById(storyId).select('author isCompleted')
    if (!story) return res.status(404).json({ error: 'Story not found' })

    if (story.isCompleted) {
      return res.status(403).json({ error: 'This story has been completed and is no longer accepting contributions.' })
    }

    const isStoryAuthor = String(story.author) === String(authorId)
    const status = isStoryAuthor ? 'accepted' : 'pending'

    const contribution = await Contribution.create({
      story: storyId,
      author: authorId,
      content,
      status,
      accepted: isStoryAuthor
    })
    await Story.findByIdAndUpdate(storyId, { $push: { contributions: contribution._id } })

    // if author self-contributes, add to contributors (no duplicates, skip story author)
    if (isStoryAuthor) {
      await Story.findByIdAndUpdate(storyId, {
        $addToSet: { contributors: authorId }
      })
    }
    await contribution.populate('author', 'displayName avatar avatarSeed avatarStyle')

    const io = req.app?.get('io')
    if (io) io.to(`story_${storyId}`).emit('contribution:added', contribution)

    // notify story author about new contribution (skip if author is contributing to own story)
    if (!isStoryAuthor) {
      await createNotification({
        userId: story.author,
        message: `${contribution.author.displayName} submitted a contribution to your story.`,
        type: 'new_contribution',
        storyId
      })
    }

    const message = isStoryAuthor
      ? 'Your contribution has been added to the story.'
      : 'Your contribution has been submitted for review.'

    res.json({ contribution, message })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET contributions — author sees all, others see only accepted
exports.getContributions = async (req, res) => {
  try {
    const storyId = req.params.storyId
    const story = await Story.findById(storyId).select('author')
    if (!story) return res.status(404).json({ error: 'Story not found' })

    const isAuthor = req.userId && String(story.author) === String(req.userId)
    const filter = isAuthor ? { story: storyId } : { story: storyId, status: 'accepted' }

    const list = await Contribution.find(filter)
      .populate('author', 'displayName avatar avatarSeed avatarStyle')
      .sort({ createdAt: 1 })

    res.json({ contributions: list, isAuthor })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH /api/stories/:storyId/contributions/:contributionId/status
exports.updateContributionStatus = async (req, res) => {
  try {
    const { storyId, contributionId } = req.params
    const { status } = req.body
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const story = await Story.findById(storyId).select('author')
    if (!story) return res.status(404).json({ error: 'Story not found' })
    if (String(story.author) !== String(req.userId)) {
      return res.status(403).json({ error: 'Only the author can update contribution status' })
    }

    const contribution = await Contribution.findByIdAndUpdate(
      contributionId,
      { status, accepted: status === 'accepted' },
      { new: true }
    ).populate('author', 'displayName avatar avatarSeed avatarStyle')

    if (!contribution) return res.status(404).json({ error: 'Contribution not found' })

    // when accepted, add contributor to story.contributors (no duplicates, skip story author)
    if (status === 'accepted' && contribution.author) {
      const contributorId = contribution.author._id || contribution.author
      if (String(contributorId) !== String(story.author)) {
        await Story.findByIdAndUpdate(storyId, {
          $addToSet: { contributors: contributorId }
        })
      }
    }

    const io = req.app?.get('io')
    if (io) io.to(`story_${storyId}`).emit('contribution:updated', contribution)

    // notify the contributor about the decision
    if (contribution.author) {
      const contributorId = contribution.author._id || contribution.author
      const storyDoc = await Story.findById(storyId).select('title')
      const storyTitle = storyDoc?.title || 'a story'
      await createNotification({
        userId: contributorId,
        message: status === 'accepted'
          ? `Your contribution to "${storyTitle}" was accepted! 🎉`
          : `Your contribution to "${storyTitle}" was not accepted.`,
        type: status,
        storyId
      })
    }

    res.json({ contribution })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
