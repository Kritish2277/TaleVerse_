import React, { createContext, useEffect, useState, useCallback } from 'react'
import * as authService from '../services/auth'
import { apiFetch } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tv-user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || localStorage.getItem('tv-token'))

  // Persist user
  useEffect(() => {
    localStorage.setItem('tv-user', JSON.stringify(user || null))
  }, [user])

  // Persist token under both keys so all code paths find it
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('tv-token', token)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('tv-token')
    }
  }, [token])

  // Fetch latest user data from server and merge into state
  // Computes live points from stats so the header always reflects reality
  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiFetch('/users/me', { token })
      if (res?.user) {
        const livePoints = res.stats?.points ?? res.user.points ?? 0
        setUser(prev => ({ ...prev, ...res.user, points: livePoints }))
      }
    } catch {
      // silently ignore — stale data is better than a crash
    }
  }, [token])

  // Refresh on mount and whenever token changes (e.g. after login)
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const register = async (payload) => {
    const res = await authService.register(payload)
    setUser(res.user)
    setToken(res.token)
    return res
  }

  const login = async (payload) => {
    const res = await authService.login(payload)
    setUser(res.user)
    setToken(res.token)
    return res
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  // Allow Profile page to update user fields without re-login
  const updateUser = (patch) => setUser(prev => ({ ...prev, ...patch }))

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
