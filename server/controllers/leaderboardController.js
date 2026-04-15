const User = require('../models/User')
const Story = require('../models/Story')
const Contribution = require('../models/Contribution')

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select('displayName avatar avatarSeed avatarStyle')

    const result = []

    for (const u of users) {
      const stories = await Story.find({ author: u._id })
const contributions = await Contribution.find({ author: u._id })

const storyCount = stories.length
const contributionCount = contributions.length

      const points = (storyCount * 10) + (contributionCount * 5)

result.push({
  _id: u._id,
  displayName: u.displayName,
  avatarSeed: u.avatarSeed,
  avatarStyle: u.avatarStyle,
  stories: storyCount,
  contributions: contributionCount,
  points
})

console.log('USER:', u.displayName)
console.log('Stories found:', stories)
console.log('Contributions found:', contributions)
    }

    result.sort((a, b) => b.points - a.points)

    res.json({ users: result })

  } catch (err) {
    console.error('[Leaderboard ERROR]', err)
    res.status(500).json({ error: err.message })
  }
}