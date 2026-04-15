import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, MessageCircle, BookOpen, Pencil, Check, X, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { apiFetch } from '../services/api'
import { listContributions, addContribution, updateContributionStatus } from '../services/contributions'
import { dummyStoryDetails } from '../data/dummystoryDetails'
import AuthContext from '../context/AuthContext'
import CommentPanel from '../components/CommentPanel'
import { getAvatarSrc } from '../utils/avatar'

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Story() {
  const { id } = useParams()
  const { user, token, refreshUser } = useContext(AuthContext)

  const [story, setStory] = useState(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [contributions, setContributions] = useState([])
  const [isAuthor, setIsAuthor] = useState(false)
  const [contribText, setContribText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)
  const [pendingOpen, setPendingOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [toast, setToast] = useState(null) // { message, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiFetch(`/stories/${id}`).catch(() => null),
      listContributions(id, token).catch(() => null)
    ]).then(([storyRes, contribRes]) => {
      console.log('[Story] storyRes:', storyRes?.story?.likeCount, 'likedByMe:', storyRes?.story?.likedByMe)
      if (storyRes?.story) {
        setStory(storyRes.story)
        setLikeCount(storyRes.story.likeCount || 0)
        setCommentsCount(storyRes.story.commentsCount || 0)
        setLiked(storyRes.story.likedByMe || false)
        setIsCompleted(storyRes.story.isCompleted || false)
      } else {
        setStory(dummyStoryDetails)
      }
      if (contribRes) {
        console.log('[Story] contributions:', contribRes.contributions?.length, 'isAuthor:', contribRes.isAuthor)
        setContributions(contribRes.contributions || [])
        setIsAuthor(contribRes.isAuthor || false)
      }
    }).finally(() => setLoading(false))
  }, [id, token])

  const handleLike = async () => {
    if (!token) return
    const wasLiked = liked
    // optimistic
    setLiked(!wasLiked)
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1)
    try {
      const res = await apiFetch(`/stories/${id}/like`, { method: 'POST', token })
      console.log('[Story] like toggled:', res)
      // sync authoritative values from server
      setLiked(res.liked)
      setLikeCount(res.likeCount)
    } catch (err) {
      console.error('[Story] like error:', err)
      // revert
      setLiked(wasLiked)
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
    }
  }

  const handleSubmitContribution = async () => {
    if (!contribText.trim() || !token) return
    setSubmitting(true)
    try {
      const res = await addContribution(id, { content: contribText, token })
      if (res.contribution) {
        setContributions(prev => [...prev, res.contribution])
      }
      setContribText('')
      showToast(res.message || 'Contribution submitted!')
      refreshUser() // points updated: +5 for contribution
    } catch (err) {
      console.error(err)
      showToast(err?.error || 'Failed to submit contribution.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (contributionId, status) => {
    try {
      const res = await updateContributionStatus(id, contributionId, status, token)
      if (res.contribution) {
        setContributions(prev =>
          prev.map(c => String(c._id) === String(contributionId) ? res.contribution : c)
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleComplete = async () => {
    if (!window.confirm('Mark this story as completed? No further contributions will be accepted.')) return
    try {
      const res = await apiFetch(`/stories/${id}/complete`, { method: 'PATCH', token })
      setIsCompleted(true)
      showToast(res.message || 'Story marked as completed.')
    } catch (err) {
      showToast(err?.error || 'Failed to complete story.', 'error')
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading story...</div>
  if (!story) return <div style={{ padding: 40 }}>Story not found.</div>

  const acceptedContributions = contributions.filter(c => c.status === 'accepted' || c.accepted)
  const pendingContributions = contributions.filter(c => c.status === 'pending' && !c.accepted)
  const isAuthorView = isAuthor || (user && story.author && String(story.author._id || story.author) === String(user.id))

  const storyBody = [story.meta?.intro, ...acceptedContributions.map(c => c.content || c.text)].filter(Boolean).join('\n\n')

  return (
    <div className="story-page">
      <div className="story-page-inner">

        {/* TITLE + ACTIONS */}
        <div className="story-page-header">
          <div>
            <h1 className="story-title">{story.title}</h1>
            <p className="story-author-line">
              by <strong>{story.author?.displayName || 'Anonymous'}</strong>
              {isCompleted && (
                <span className="completed-badge">
                  <CheckCircle size={13} /> Completed
                </span>
              )}
            </p>
          </div>
          <div className="story-action-bar">
            {isAuthorView && !isCompleted && (
              <button className="action-btn complete-action" onClick={handleComplete} title="Mark story as completed">
                <CheckCircle size={16} /> Complete
              </button>
            )}
            <button
              className={`action-btn like-action ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={!token}
              title={token ? 'Like this story' : 'Log in to like'}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              <span>{likeCount}</span>
            </button>
            <button className="action-btn comment-action" onClick={() => setCommentOpen(true)}>
              <MessageCircle size={18} />
              <span>{commentsCount}</span>
            </button>
          </div>
        </div>

        {/* FULL STORY BODY */}
        <div className="story-full">
          <div className="section-label"><BookOpen size={16} /> Story</div>
          {storyBody
            ? storyBody.split('\n\n').map((para, i) => (
                <p key={i} className="story-text">{para}</p>
              ))
            : <p className="story-text" style={{ color: 'var(--muted)' }}>This story is just getting started...</p>
          }
        </div>

        {/* ACCEPTED CONTRIBUTIONS (visible to all) */}
        {acceptedContributions.length > 0 && (
          <div className="story-contributions">
            <div className="section-label"><Pencil size={16} /> Contributions</div>
            {acceptedContributions.map(c => (
              <div key={c._id} className="contribution-card">
                <p className="contribution-text">{c.content || c.text}</p>
                <div className="contribution-footer">
                  <span>{c.author?.displayName || 'Anonymous'}</span>
                  <span>{c.createdAt ? timeAgo(c.createdAt) : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTRIBUTORS / CREDITS */}
        {story.contributors?.length > 0 && (
          <div className="credits-section">
            <div className="section-label"><CheckCircle size={16} /> Contributors</div>
            <div className="credits-list">
              {story.contributors.map(c => (
                <div key={c._id} className="credit-item" title={c.displayName}>
                  <img
                    className="credit-avatar"
                    src={getAvatarSrc(c)}
                    alt={c.displayName}
                    onError={e => { e.target.onerror = null; e.target.src = getAvatarSrc({ avatarSeed: c.displayName }) }}
                  />
                  <span className="credit-name">{c.displayName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PENDING CONTRIBUTIONS — author only */}
        {isAuthorView && pendingContributions.length > 0 && (
          <div className="pending-section">
            <button
              className="pending-toggle"
              onClick={() => setPendingOpen(o => !o)}
            >
              <span>Pending Contributions ({pendingContributions.length})</span>
              {pendingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {pendingOpen && (
              <div className="pending-list">
                {pendingContributions.map(c => (
                  <div key={c._id} className="contribution-card pending-card">
                    <p className="contribution-text">{c.content || c.text}</p>
                    <div className="contribution-footer">
                      <span>{c.author?.displayName || 'Anonymous'}</span>
                      <span>{c.createdAt ? timeAgo(c.createdAt) : ''}</span>
                    </div>
                    <div className="pending-actions">
                      <button
                        className="status-btn accept-btn"
                        onClick={() => handleStatusUpdate(c._id, 'accepted')}
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        className="status-btn reject-btn"
                        onClick={() => handleStatusUpdate(c._id, 'rejected')}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD CONTRIBUTION — all logged-in users, blocked if completed */}
        {token && !isCompleted && (
          <div className="contribution-box">
            <div className="section-label">
              <Pencil size={16} />
              {isAuthorView ? 'Add to Your Story' : 'Add Your Contribution'}
            </div>
            <textarea
              className="contribution-textarea"
              placeholder={
                isAuthorView
                  ? 'Continue your story...'
                  : 'Continue the story creatively... Your contribution will be reviewed by the author.'
              }
              value={contribText}
              onChange={e => setContribText(e.target.value)}
              rows={5}
            />
            <button
              className="btn primary contrib-submit"
              onClick={handleSubmitContribution}
              disabled={submitting || !contribText.trim()}
            >
              {submitting ? 'Submitting...' : isAuthorView ? 'Add to Story' : 'Submit Contribution'}
            </button>
          </div>
        )}

        {token && isCompleted && (
          <div className="contribution-box completed-notice">
            <CheckCircle size={18} />
            <span>This story has been completed and is no longer accepting contributions.</span>
          </div>
        )}

        {!token && (
          <div className="contribution-box" style={{ textAlign: 'center', color: 'var(--muted)' }}>
            <p>Log in to contribute to this story.</p>
          </div>
        )}

      </div>

      {/* Comment Panel */}
      <CommentPanel
        storyId={id}
        isOpen={commentOpen}
        onClose={() => {
          setCommentOpen(false)
          apiFetch(`/stories/${id}`).then(res => {
            if (res?.story) setCommentsCount(res.story.commentsCount || 0)
          }).catch(() => {})
        }}
      />

      {/* Toast notification */}
      {toast && (
        <div className={`contrib-toast contrib-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
