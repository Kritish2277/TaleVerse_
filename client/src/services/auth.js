import { apiFetch } from './api'

export async function register({ email, password, displayName, name }) {
  const resolvedName = name || displayName
  return apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: resolvedName, displayName: resolvedName })
  })
}

export async function login({ email, password }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
}
