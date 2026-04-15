import React, { useState, useEffect } from 'react'
import { apiFetch } from '../services/api'
import { getAvatarSrc } from '../utils/avatar'
import { FaMedal } from 'react-icons/fa'

export default function Leaderboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiFetch('/leaderboard')
      .then(res => { if (mounted) setUsers(res.users || []) })
      .catch(err => console.error('[Leaderboard]', err))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const getMedal = (idx) => {
    if (idx === 0) return <FaMedal className="gold" size={18} />
    if (idx === 1) return <FaMedal className="silver" size={18} />
    if (idx === 2) return <FaMedal className="bronze" size={18} />
    return <span className="rank-num">{idx + 1}</span>
  }

  return (
    <div className="leaderboard-page">
      <div className="page-container">

        <div className="lb-header-top">
          <h2 className="lb-title">Hall of Creators</h2>
          <p className="lb-subtitle">Top storytellers ranked by creativity and contributions</p>
        </div>

        <div className="leaderboard-card">

          {loading && <div className="empty">Loading leaderboard...</div>}

          {!loading && users.length === 0 && (
            <div className="empty">No creators yet. Be the first!</div>
          )}

          {!loading && users.length > 0 && (
            <>
              <div className="lb-header">
                <span>Rank</span>
                <span>Creator</span>
                <span>Points</span>
                <span>Stories</span>
                <span>Contributions</span>
              </div>

              {users.map((u, idx) => (
                <div key={u._id} className={`lb-row ${idx < 3 ? 'top' : ''}`}>

                  <div className="rank">{getMedal(idx)}</div>

                  <div className="user">
                    <img
                      src={getAvatarSrc(u)}
                      alt={u.displayName}
                      onError={e => { e.target.onerror = null; e.target.src = getAvatarSrc({ avatarSeed: u.displayName }) }}
                    />
                    <span>{u.displayName || 'Anonymous'}</span>
                  </div>

                  <div className="points">{u.points ?? 0}</div>
                  <div>{u.stories ?? 0}</div>
                  <div>{u.contributions ?? 0}</div>

                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
