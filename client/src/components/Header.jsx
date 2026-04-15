import React, { useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import AuthContext from '../context/AuthContext'
import PresenceContext from '../context/PresenceContext'
import { getAvatarSrc } from '../utils/avatar'
import NotificationBell from './NotificationBell'

export default function Header(){
  const navigate = useNavigate()
  const { user, refreshUser } = useContext(AuthContext)
  const { presence } = useContext(PresenceContext)

  // Refresh points every time the header mounts (route change)
  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <header className="tv-header">
      <div className="left" onClick={()=>navigate('/')}
           style={{display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}}>
        <Logo size={40} />
      </div>

      <nav className="nav">
        <Link to="/home">Explore</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/create">Create Story</Link>
      </nav>

      <div className="right">
        <div className="points">{user ? `${user.points ?? 0} pts` : '0 pts'}</div>
        <NotificationBell />
        <div className="presence">
          {presence && presence.length > 0 ? (
            <>
              <div className="avatars">
                {presence.slice(0,3).map(p=> (
                  <div key={p.userId} className="avatar">
                    <img
                      src={getAvatarSrc(p)}
                      alt={`${p.displayName} avatar`}
                      onError={e => { e.target.onerror = null; e.target.src = getAvatarSrc({ avatarSeed: p.displayName }) }}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
              <div className="presence-count">{presence.length}</div>
              {presence.some(p=>p.typing) && <div className="typing-indicator">✍️</div>}
            </>
          ) : null}
        </div>
        <button 
          className="profile-btn"
          onClick={()=>navigate('/profile')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '999px',
            border: '1px solid var(--borders)',
            background: 'var(--card)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.2s ease',
            padding: 0,
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(124, 106, 230, 0.1)'}
          onMouseLeave={(e) => e.target.style.background = 'var(--card)'}
        >
          {user ? (
            <img
              src={getAvatarSrc(user)}
              alt="Profile"
              onError={e => { e.target.onerror = null; e.target.src = getAvatarSrc({ avatarSeed: user.displayName }) }}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : '👤'}
        </button>
      </div>
    </header>
  )
}
