const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export async function apiFetch(path, opts = {}) {
  const headers = opts.headers || {}

  // Use explicitly passed token, then fall back to localStorage
  const token = opts.token || localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`

  const url = `${API_BASE}${path}`
  const method = opts.method || 'GET'

  console.log(`[api] ${method} ${url}`, token ? 'authed' : 'no token')

  const res = await fetch(url, { ...opts, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    console.error(`[api] ${method} ${url} → ${res.status}`, data)
    throw data
  }

  console.log(`[api] ${method} ${url} → ${res.status}`, data)
  return data
}
