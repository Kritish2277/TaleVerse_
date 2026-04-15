import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../services/api'
import AuthContext from '../context/AuthContext'
import { dummyStories } from '../data/dummyData'
import { PenTool, BookOpen, Sparkles, MessageCircle, Heart } from 'lucide-react'
import CommentPanel from '../components/CommentPanel'
import { getAvatarSrc } from '../utils/avatar'

export default function Home() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [commentStory, setCommentStory] = useState(null) // storyId for panel
  const { user, token } = useContext(AuthContext)
  const navigate = useNavigate()

  // Re-fetch when token changes so likedByMe reflects the logged-in user
  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiFetch('/stories')
      .then(res => {
        if (mounted) {
          const data = res.stories?.length ? res.stories : dummyStories
          console.log('[Home] stories loaded, sample likedByMe:', data[0]?.likedByMe)
          setStories(data)
        }
      })
      .catch(() => { if (mounted) setStories(dummyStories) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [token])

  const handleLike = async (e, storyId) => {
    e.stopPropagation()
    if (!token) return navigate('/auth')

    // snapshot current state before optimistic update
    const current = stories.find(s => String(s._id) === String(storyId))
    const wasLiked = current?.likedByMe || false

    setStories(prev => prev.map(s => {
      if (String(s._id) !== String(storyId)) return s
      return {
        ...s,
        likeCount: wasLiked ? (s.likeCount || 1) - 1 : (s.likeCount || 0) + 1,
        likedByMe: !wasLiked
      }
    }))

    try {
      await apiFetch(`/stories/${storyId}/like`, { method: 'POST', token })
    } catch {
      // revert to original state
      setStories(prev => prev.map(s => {
        if (String(s._id) !== String(storyId)) return s
        return {
          ...s,
          likeCount: wasLiked ? (s.likeCount || 0) + 1 : (s.likeCount || 1) - 1,
          likedByMe: wasLiked
        }
      }))
    }
  }

  const openComments = (e, storyId) => {
    e.stopPropagation()
    setCommentStory(storyId)
  }

  let filteredStories = stories.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.genre?.toLowerCase().includes(search.toLowerCase())
  )
  if (tab === 'trending') filteredStories = [...filteredStories].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
  if (tab === 'recent') filteredStories = [...filteredStories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="home">
      {/* HERO */}
      <div className="hero">
        <div className="blur-circle one"></div>
        <div className="blur-circle two"></div>
        <div className="blur-circle three"></div>
        <PenTool className="hero-icon i1" />
        <BookOpen className="hero-icon i2" />
        <Sparkles className="hero-icon i3" />
        <MessageCircle className="hero-icon i4" />
        <PenTool className="hero-icon i5" />
        <Sparkles className="hero-icon i6" />
        <BookOpen className="hero-icon i7" />
        <PenTool className="hero-icon i8" />
        <BookOpen className="hero-icon i9" />
        <MessageCircle className="hero-icon i10" />
        <Sparkles className="hero-icon i11" />
        <div className="particles"></div>
        <div className="hero-content">
          <h1>Write the next great story,<br /><span>together</span></h1>
          <p>Join writers collaborating in real-time to create amazing stories and worlds.</p>
          <div className="hero-buttons">
            <button className="btn primary" onClick={() => navigate('/create')}>Start a Story</button>
            <button className="btn soft" onClick={() => document.getElementById('stories-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Stories
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">2,400+</span>
              <span className="hero-stat-label">Stories Written</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">8,100+</span>
              <span className="hero-stat-label">Writers Joined</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">14k+</span>
              <span className="hero-stat-label">Contributions</span>
            </div>
          </div>
        </div>
        <div className="wave">
          <svg viewBox="0 0 1440 320">
            <path fill="url(#gradient)" fillOpacity="1" d="M0,160L80,170C160,180,320,200,480,192C640,180,800,140,960,138.7C1120,140,1280,180,1360,200L1440,224L1440,320L0,320Z"></path>
            <defs><linearGradient id="gradient"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#6366f1"/></linearGradient></defs>
          </svg>
        </div>
        <div className="wave wave2">
          <svg viewBox="0 0 1440 320">
            <path fill="url(#gradient2)" fillOpacity="1" d="M0,160L80,170C160,180,320,200,480,192C640,180,800,140,960,138.7C1120,140,1280,180,1360,200L1440,224L1440,320L0,320Z"></path>
            <defs><linearGradient id="gradient2"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#6366f1"/></linearGradient></defs>
          </svg>
        </div>
      </div>

      {/* STORIES */}
      <div id="stories-section" className="stories-section">
        <div className="stories-header">
          <div>
            <h2>Active Stories</h2>
            <p>Discover stories looking for their next chapter.</p>
          </div>
          <div className="stories-actions">
            <input
              type="text"
              placeholder="Search by title or genre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="tabs">
              <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All</button>
              <button className={tab === 'trending' ? 'active' : ''} onClick={() => setTab('trending')}>Trending</button>
              <button className={tab === 'recent' ? 'active' : ''} onClick={() => setTab('recent')}>Recent</button>
            </div>
          </div>
        </div>

        {loading && <div className="empty-state">Loading stories...</div>}

        {!loading && filteredStories.length > 0 && (
          <div className="stories-grid">
            {filteredStories.map(s => (
              <div key={s._id} className="story-card" onClick={() => navigate(`/stories/${s._id}`)}>

                {/* TOP — genre + date */}
                <div className="story-top">
                  <span className="genre">{s.genre || 'Fiction'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s.isCompleted && <span className="completed-badge-card">✓ Completed</span>}
                    <span className="time">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>

                {/* TITLE */}
                <h3 className="story-title-text">{s.title}</h3>

                {/* PREVIEW — 2 lines, "Read More →" inline at end */}
                <p className="story-preview">
                  {s.preview
                    ? s.preview.slice(0, 110) + (s.preview.length > 110 ? '… ' : ' ')
                    : 'Start reading this amazing story… '}
                  <span
                    className="read-more"
                    onClick={e => { e.stopPropagation(); navigate(`/stories/${s._id}`) }}
                  >
                    Read More →
                  </span>
                </p>

                {/* SPACER pushes footer to bottom */}
                <div className="card-spacer" />

                {/* FOOTER — avatar+name on left, icons on right */}
                <div className="story-footer">
                  <div className="author">
                    <img
                      className="card-avatar"
                      src={getAvatarSrc(s.author)}
                      alt={s.author?.displayName || 'Author'}
                      loading="lazy"
                      onError={e => {
                        e.target.onerror = null
                        e.target.src = getAvatarSrc({ avatarSeed: s.author?.displayName || 'user' })
                      }}
                    />
                    <span className="author-name">{s.author?.displayName || 'Anonymous'}</span>
                  </div>

                  <div className="story-meta">
                    <button
                      className="meta-item meta-btn"
                      onClick={e => openComments(e, s._id)}
                      title="Comments"
                    >
                      <MessageCircle size={14} />
                      <span className="meta-count">{s.commentsCount || 0}</span>
                    </button>

                    <button
                      className={`meta-item meta-btn like-btn ${s.likedByMe ? 'liked' : ''}`}
                      onClick={e => handleLike(e, s._id)}
                      title="Like"
                    >
                      <Heart size={14} fill={s.likedByMe ? 'currentColor' : 'none'} />
                      <span className="meta-count">{s.likeCount || 0}</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Panel */}
      <CommentPanel
        storyId={commentStory}
        isOpen={!!commentStory}
        onClose={() => setCommentStory(null)}
      />
    </div>
  )
}
