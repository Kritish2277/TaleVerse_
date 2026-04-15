import React, {useState, useContext} from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

export default function Auth(){
  const [mode,setMode] = useState('login')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [displayName,setDisplayName] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)
  const { login, register } = useContext(AuthContext)
  const navigate = useNavigate()

  const submit = async () => {
    setError(null)
    if (!email.trim() || !password.trim()) return setError('Email and password are required')
    if (mode === 'signup' && !displayName.trim()) return setError('Display name is required')

    setLoading(true)
    try {
      if (mode === 'signup') {
        await register({ email, password, displayName })
      } else {
        await login({ email, password })
      }
      navigate('/home')
    } catch (err) {
      setError(err?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: 20}}>
          <img src="/logo.png" alt="TaleVerse" style={{width:56,height:56,objectFit:'contain'}} onError={(e)=>e.target.style.display='none'} />
        </div>
        <div className="auth-toggle">
          <button 
            className={mode === 'login' ? 'active' : ''} 
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button 
            className={mode === 'signup' ? 'active' : ''} 
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>
        
        <h2 style={{textAlign: 'center'}}>{mode === 'login' ? 'Welcome back' : 'Get started'}</h2>
        <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
          {mode === 'login' 
            ? 'Sign in to access your stories' 
            : 'Join TaleVerse to start creating'}
        </p>
        
        <input 
          placeholder="Email address" 
          type="email"
          value={email} 
          onChange={e=>setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {mode==='signup' && (
          <input 
            placeholder="Display name" 
            value={displayName} 
            onChange={e=>setDisplayName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        )}
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e=>setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        
        {error && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '12px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <button 
          className="btn primary" 
          onClick={submit} 
          disabled={loading}
          style={{marginTop: '20px'}}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </section>
  )
}
