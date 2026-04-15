import React, { useState, useContext, useEffect, useRef } from 'react'
import { Heart, X, Send, CornerDownRight } from 'lucide-react'
import AuthContext from '../context/AuthContext'
import { getComments, addComment, toggleCommentLike } from '../services/comments'

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Uses server-provided likedByMe field — avoids ObjectId vs string comparison issues
function CommentItem({ comment, onReply, onLike, currentUserId }) {
  // prefer server-computed likedByMe; fall back to local likes array check
  const liked = comment.likedByMe !== undefined
    ? comment.likedByMe
    : comment.likes?.some(id => String(id) === String(currentUserId))

  return (
    <div className={`comment-item ${comment.depth > 0 ? 'comment-reply' : ''}`}>
      <div className="comment-avatar">
        {(comment.author?.displayName || 'A')[0].toUpperCase()}
      </div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.author?.displayName || 'Anonymous'}</span>
          <span className="comment-time">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="comment-content">{comment.content}</p>
        <div className="comment-actions">
          <button
            className={`comment-like-btn ${liked ? 'liked' : ''}`}
            onClick={() => onLike(comment._id)}
          >
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
            <span>{comment.likeCount ?? comment.likes?.length ?? 0}</span>
          </button>
          {comment.depth === 0 && (
            <button className="comment-reply-btn" onClick={() => onReply(comment)}>
              <CornerDownRight size={13} /> Reply
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentPanel({ storyId, isOpen, onClose }) {
  const { user, token } = useContext(AuthContext)
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const fetchComments = () => {
    if (!storyId) return
    setLoading(true)
    getComments(storyId, token)
      .then(res => {
        console.log('[CommentPanel] fetched comments:', res.comments?.length, res.comments?.[0])
        setComments(res.comments || [])
      })
      .catch(err => console.error('[CommentPanel] fetch error:', err))
      .finally(() => setLoading(false))
  }

  // Fetch on open, and re-fetch when token changes (so likedByMe is correct after login)
  useEffect(() => {
    if (!isOpen || !storyId) return
    fetchComments()
  }, [isOpen, storyId, token])

  useEffect(() => {
    if (replyTo && inputRef.current) inputRef.current.focus()
  }, [replyTo])

  const handleSubmit = async () => {
    if (!text.trim() || !token) return

    const tempId = `temp-${Date.now()}`
    const optimistic = {
      _id: tempId,
      content: text.trim(),
      author: { displayName: user?.displayName || 'You', _id: user?.id },
      likes: [],
      likeCount: 0,
      likedByMe: false,
      depth: replyTo ? 1 : 0,
      parentComment: replyTo?._id || null,
      createdAt: new Date().toISOString()
    }

    setComments(prev => [...prev, optimistic])
    const savedText = text
    const savedReply = replyTo
    setText('')
    setReplyTo(null)

    try {
      const res = await addComment(storyId, {
        content: savedText,
        parentCommentId: savedReply?._id || undefined
      }, token)
      console.log('[CommentPanel] comment saved:', res.comment?._id)
      // replace optimistic entry with real server response
      setComments(prev => prev.map(c => c._id === tempId
        ? { ...res.comment, likedByMe: false, likeCount: 0 }
        : c
      ))
    } catch (err) {
      console.error('[CommentPanel] addComment error:', err)
      setComments(prev => prev.filter(c => c._id !== tempId))
    }
  }

  const handleLike = async (commentId) => {
    if (!token) return

    // snapshot before optimistic update
    const target = comments.find(c => String(c._id) === String(commentId))
    if (!target) return
    const wasLiked = target.likedByMe !== undefined
      ? target.likedByMe
      : target.likes?.some(id => String(id) === String(user?.id))
    const prevCount = target.likeCount ?? target.likes?.length ?? 0

    // optimistic
    setComments(prev => prev.map(c =>
      String(c._id) === String(commentId)
        ? { ...c, likedByMe: !wasLiked, likeCount: wasLiked ? prevCount - 1 : prevCount + 1 }
        : c
    ))

    try {
      const res = await toggleCommentLike(commentId, token)
      console.log('[CommentPanel] comment like toggled:', res)
      // sync authoritative count from server
      setComments(prev => prev.map(c =>
        String(c._id) === String(commentId)
          ? { ...c, likedByMe: res.liked, likeCount: res.likeCount }
          : c
      ))
    } catch (err) {
      console.error('[CommentPanel] toggleCommentLike error:', err)
      // revert
      setComments(prev => prev.map(c =>
        String(c._id) === String(commentId)
          ? { ...c, likedByMe: wasLiked, likeCount: prevCount }
          : c
      ))
    }
  }

  const topLevel = comments.filter(c => !c.parentComment)
  const replies = comments.filter(c => c.parentComment)

  if (!isOpen) return null

  return (
    <div className="comment-overlay" onClick={onClose}>
      <div className="comment-panel" onClick={e => e.stopPropagation()}>
        <div className="comment-panel-header">
          <span>Comments ({comments.length})</span>
          <button className="comment-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="comment-list">
          {loading && <p className="comment-empty">Loading...</p>}
          {!loading && comments.length === 0 && (
            <p className="comment-empty">No comments yet. Be the first!</p>
          )}
          {!loading && topLevel.map(c => (
            <React.Fragment key={c._id}>
              <CommentItem
                comment={c}
                onReply={setReplyTo}
                onLike={handleLike}
                currentUserId={user?.id}
              />
              {replies
                .filter(r => String(r.parentComment) === String(c._id))
                .map(r => (
                  <CommentItem
                    key={r._id}
                    comment={r}
                    onReply={() => {}}
                    onLike={handleLike}
                    currentUserId={user?.id}
                  />
                ))}
            </React.Fragment>
          ))}
        </div>

        {token ? (
          <div className="comment-input-area">
            {replyTo && (
              <div className="reply-indicator">
                Replying to <strong>{replyTo.author?.displayName}</strong>
                <button onClick={() => setReplyTo(null)}><X size={12} /></button>
              </div>
            )}
            <div className="comment-input-row">
              <input
                ref={inputRef}
                className="comment-input"
                placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              />
              <button className="comment-send" onClick={handleSubmit} disabled={!text.trim()}>
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-empty" style={{ padding: '16px', textAlign: 'center' }}>
            Log in to comment
          </p>
        )}
      </div>
    </div>
  )
}
