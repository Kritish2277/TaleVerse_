import { useState, useEffect, useRef, useContext } from 'react'
import { Bell } from 'lucide-react'
import { apiFetch } from '../services/api'
import AuthContext from '../context/AuthContext'

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const TYPE_ICON = {
  accepted: '✅',
  rejected: '❌',
  new_contribution: '✍️'
}

export default function NotificationBell() {
  const { token } = useContext(AuthContext)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const fetchNotifications = () => {
    if (!token) return
    apiFetch('/notifications', { token })
      .then(res => {
        setNotifications(res.notifications || [])
        setUnread(res.unreadCount || 0)
      })
      .catch(() => {})
  }

  // poll every 30 s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [token])

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(o => !o)
  }

  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
    apiFetch(`/notifications/${id}/read`, { method: 'PATCH', token }).catch(() => {})
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnread(0)
    apiFetch('/notifications/read-all', { method: 'PATCH', token }).catch(() => {})
  }

  if (!token) return null

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notif-bell" onClick={handleOpen} title="Notifications">
        <Bell size={18} />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            {unread > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 && (
              <p className="notif-empty">No notifications yet.</p>
            )}
            {notifications.map(n => (
              <div
                key={n._id}
                className={`notif-item ${n.isRead ? '' : 'notif-unread'}`}
                onClick={() => !n.isRead && markRead(n._id)}
              >
                <span className="notif-icon">{TYPE_ICON[n.type] || '🔔'}</span>
                <div className="notif-body">
                  <p className="notif-msg">{n.message}</p>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </div>
                {!n.isRead && <span className="notif-dot" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
