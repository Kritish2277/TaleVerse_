import {useContext, useState, useRef, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import { generateAvatarUrl } from '../utils/avatar'
import { apiFetch } from '../services/api'

export default function Profile(){
  const { user, logout, token } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || null)
  const [imageType, setImageType] = useState('none')
  const [avatarStyle, setAvatarStyle] = useState(user?.avatarStyle || 'adventurer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ stories: 0, contributions: 0, points: 0 })
  const [preferences, setPreferences] = useState(() => ({
    darkMode: localStorage.getItem('tv-dark') === '1',
    emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
    contributionAlerts: localStorage.getItem('contributionAlerts') !== 'false',
    weeklySummary: localStorage.getItem('weeklySummary') !== 'false'
  }))
  const fileInputRef = useRef(null)

  // Fetch live stats on mount
  useEffect(() => {
    if (!token) return
    apiFetch('/users/me', { token })
      .then(res => { if (res.stats) setStats(res.stats) })
      .catch(err => console.error('[Profile] stats fetch error:', err))
  }, [token])

  const avatarStyles = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'bottts',
  'initials',
  'micah',
  'pixel-art',
  'fun-emoji'
]

const avatarSeeds = [
  'kriti', 'story', 'magic', 'hero', 'dragon',
  'writer', 'galaxy', 'dream', 'shadow', 'light'
]

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    localStorage.setItem(key, value.toString())
    
    // Apply dark mode immediately
    if (key === 'darkMode') {
      document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light')
    }
  }

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      setSelectedImage(file)
      setSelectedAvatar(null)
      setImageType('upload')
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar)
    setSelectedImage(null)
    setImagePreview(null)
    setImageType('avatar')
    setError('')
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setSelectedAvatar(null)
    setImagePreview(null)
    setImageType('none')
    setError('')
  }

  const handleSave = async () => {
  try {
    const res = await apiFetch('/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      token,
      body: JSON.stringify({
        displayName,
        avatar: selectedAvatar
      })
    })

    alert("Profile updated successfully")

  } catch (err) {
    console.error("ERROR:", err)
    alert(err?.error || "Failed to update profile")
  }
}

  const handleCancel = () => {
    setDisplayName(user?.displayName || '')
    setSelectedImage(null)
    setImagePreview(null)
    setSelectedAvatar(user?.avatar || null)
    setAvatarStyle(user?.avatarStyle || 'adventurer')
    setImageType('none')
    setError('')
    setIsEditing(false)
  }

  const getAvatarSrc = () => {
  if (imagePreview) return imagePreview
  if (selectedAvatar) return selectedAvatar

  if (user?.avatar?.startsWith('http')) return user.avatar  // ✅ FIX

  if (user?.avatar) return `/avatars/${user.avatar}`

  return generateAvatarUrl(user?.avatarSeed || "User", user?.avatarStyle || 'adventurer')
}

  const points = stats.points
  const nextMilestone = Math.ceil((points + 1) / 100) * 100
  const progressPercent = Math.min((points % 100) / 100 * 100, 100)

  return (
    <div style={{
      padding: '40px 0',
      background: 'linear-gradient(135deg, var(--background) 0%, rgba(124, 106, 230, 0.05) 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 16px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '32px',
            marginBottom: '8px',
            color: 'var(--text)',
            fontWeight: 700
          }}>
            Your Profile
          </h2>
          <p style={{
            color: 'var(--muted)',
            marginBottom: '0',
            fontSize: '16px'
          }}>
            Manage your account and settings
          </p>
        </div>

        <div className="card" style={{
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          background: 'var(--card-bg)',
          border: '1px solid var(--borders)'
        }}>
          {/* Header with Edit Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--borders)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              Profile Information
            </h3>
            {!isEditing && (
              <button className="btn primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Mode */}
          {isEditing ? (
            <div style={{ marginBottom: '40px' }}>
              {/* Profile Image Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '32px'
              }}>
                <div style={{
                  position: 'relative',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: getAvatarSrc() ? 'transparent' : 'linear-gradient(135deg, #7C6AE6, #9B8CFF)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '40px',
                    overflow: 'hidden',
                    border: '4px solid var(--borders)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}>
                    {getAvatarSrc() ? (
                      <img
                        src={getAvatarSrc()}
                        alt="Profile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      (user?.displayName || 'U')[0]?.toUpperCase()
                    )}
                  </div>
                  {(imagePreview || selectedAvatar) && (
                    <button
                      onClick={handleRemoveImage}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#ff4757',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                      title="Remove image"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Image Options */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  {/* Upload from device */}
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'transparent',
                        color: 'var(--primary)',
                        border: '2px dashed var(--borders)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--primary)'
                        e.target.style.background = 'rgba(124, 106, 230, 0.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--borders)'
                        e.target.style.background = 'transparent'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zM14.06 6.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" fill="currentColor"/>
                      </svg>
                      Upload from Device
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Choose from avatars */}
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      Or choose your avatar 
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))',
                      gap: '8px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      padding: '8px',
                      border: '1px solid var(--borders)',
                      borderRadius: '8px',
                      background: 'var(--background)'
                    }}>
                      {avatarStyles.map((style) =>
  avatarSeeds.map((seed) => {
    const url = generateAvatarUrl(seed, style)

    return (
      <button
        key={style + seed}
        onClick={() => {
          setSelectedAvatar(url)
          setImageType('avatar')
          setSelectedImage(null)
          setImagePreview(null)
        }}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: selectedAvatar === url
            ? '3px solid var(--primary)'
            : '2px solid var(--borders)',
          background: 'transparent',
          cursor: 'pointer',
          padding: '2px'
        }}
      >
        <img
          src={url}
          alt="avatar"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%'
          }}
        />
      </button>
    )
  })
)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Name Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  color: 'var(--muted)',
                  fontSize: '13px',
                  marginBottom: '8px',
                  fontWeight: 600
                }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--borders)',
                    borderRadius: '8px',
                    background: 'var(--background)',
                    color: 'var(--text)',
                    fontSize: '16px',
                    fontWeight: 500
                  }}
                  placeholder="Enter your display name"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255, 59, 48, 0.2)',
                  borderRadius: '8px',
                  color: '#d63031',
                  fontSize: '14px',
                  marginBottom: '24px'
                }}>
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: 'var(--muted)',
                    border: '1px solid var(--borders)',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    opacity: isLoading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  )}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
            
          ) : (
            /* View Mode */
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '40px',
              paddingBottom: '32px',
              borderBottom: '1px solid var(--borders)',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'transparent',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '28px',
                overflow: 'hidden',
                border: '3px solid var(--borders)',
                boxShadow: '0 4px 16px rgba(124, 106, 230, 0.3)'
              }}>
                <img
                  src={getAvatarSrc()}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
                  {user?.displayName || 'User'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--muted)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                  </svg>
                  {user?.email}
                </div>
              </div>
            </div>
          )}

          {/* Points Section */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '13px', marginBottom: '12px', fontWeight: 600 }}>
              Points
            </label>
            <div style={{
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--primary)',
              background: 'linear-gradient(135deg, rgba(124, 106, 230, 0.1), rgba(155, 140, 255, 0.1))',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              {points}
            </div>
            <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--text)' }}>
              Progress to {nextMilestone} points
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'var(--borders)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary), #9B8CFF)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          {/* Member Since */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
              Member since
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
              </svg>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
            </div>
          </div>

          {/* Preferences Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
              Preferences
            </h3>
            <div style={{
              background: 'var(--background)',
              borderRadius: '12px',
              border: '1px solid var(--borders)',
              padding: '20px'
            }}>
              {/* Dark Mode Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
                    Dark Mode
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Toggle between light and dark themes
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.darkMode}
                    onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: preferences.darkMode ? 'var(--primary)' : 'var(--borders)',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: preferences.darkMode ? '22px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}></span>
                  </span>
                </label>
              </div>

              {/* Notification Toggles */}
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '12px' }}>
                Notifications
              </div>

              {/* Email Notifications */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
                    Email Notifications
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Receive email updates about your account
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: preferences.emailNotifications ? 'var(--primary)' : 'var(--borders)',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: preferences.emailNotifications ? '22px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}></span>
                  </span>
                </label>
              </div>

              {/* Contribution Alerts */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
                    Contribution Alerts
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Get notified when someone contributes to your stories
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.contributionAlerts}
                    onChange={(e) => handlePreferenceChange('contributionAlerts', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: preferences.contributionAlerts ? 'var(--primary)' : 'var(--borders)',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: preferences.contributionAlerts ? '22px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}></span>
                  </span>
                </label>
              </div>

              {/* Weekly Summary */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
                    Weekly Summary
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Receive a weekly summary of your activity
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.weeklySummary}
                    onChange={(e) => handlePreferenceChange('weeklySummary', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: preferences.weeklySummary ? 'var(--primary)' : 'var(--borders)',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: preferences.weeklySummary ? '22px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}></span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn ghost"
              onClick={handleLogout}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--borders)',
                background: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}