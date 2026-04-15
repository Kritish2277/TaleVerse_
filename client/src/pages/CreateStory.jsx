import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import { apiFetch } from '../services/api'

export default function CreateStory() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [genre, setGenre] = useState('')
  const [open, setOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)

  const { token, refreshUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const genres = [
    "Fantasy", "Sci-Fi", "Mystery", "Romance",
    "Horror", "Adventure", "Thriller",
    "Comedy", "Drama", "Other"
  ]

  const create = async () => {
    setMsg(null)
    setError(null)

    if (!title.trim()) return setError('Please enter a story title')
    if (!content.trim()) return setError('Please enter an opening paragraph')

    setLoading(true)

    try {
      await apiFetch('/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, genre }),
        token
      })

      setMsg('Story created successfully!')
      refreshUser() // points updated: +10 for new story
      setTimeout(() => navigate('/home'), 1500)

    } catch (err) {
      setError(err?.error || 'Failed to create story')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-wrapper">
      <div className="page-container centered">

        {/* HEADER */}
        <div className="create-header">
          <h1>Create a new story</h1>
          <p>Start a collaborative story and invite others to contribute</p>
        </div>

        {/* CARD */}
        <div className="editor-card">

          {/* TITLE */}
<div className="form-group">
  <label>Title</label>
  <input
    className="form-input"
    placeholder="e.g. The Clockwork City..."
    value={title}
    onChange={e => setTitle(e.target.value)}
  />
</div>

{/* GENRE */}
<div className="form-group">
  <label>Genre</label>

  <div className="custom-dropdown">
    <div
      className="form-input dropdown-trigger"
      onClick={() => setOpen(!open)}
    >
      {genre || "Select a genre..."}
      <span className={`arrow ${open ? "open" : ""}`}>⌄</span>
    </div>

    {open && (
      <div className="dropdown-menu">
        {genres.map((g, i) => (
          <div
            key={i}
            className={`dropdown-item ${genre === g ? "active" : ""}`}
            onClick={() => {
              setGenre(g)
              setOpen(false)
            }}
          >
            {g}
          </div>
        ))}
      </div>
    )}
  </div>
</div>

{/* DESCRIPTION */}
<div className="form-group">
  <label>Opening scene</label>
  <textarea
    className="form-textarea"
    placeholder="How does your story begin? Write an engaging opening paragraph..."
    rows={6}
    value={content}
    onChange={e => setContent(e.target.value)}
  />
</div>

          {/* ERROR / SUCCESS */}
          {error && <div className="error-box">{error}</div>}
          {msg && <div className="success-box">✓ {msg}</div>}

          {/* BUTTONS */}
          <div className="actions">
            <button className="btn primary" onClick={create} disabled={loading}>
              {loading ? 'Creating...' : 'Create Story'}
            </button>

            <button className="btn ghost" onClick={() => navigate('/home')}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}