const TOKEN_KEY = 'liga-mx-token'

export const getToken  = () => localStorage.getItem(TOKEN_KEY)
export const setToken  = t  => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function callAuth(body) {
  try {
    const r = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await r.json()
  } catch {
    return { error: 'Sin conexión. Verifica tu internet.' }
  }
}

export async function authLogin(username, password) {
  let bootstrap
  try {
    const us = JSON.parse(localStorage.getItem('liga-mx-users') || '[]')
    const bu = us.find(u => u.username.toLowerCase() === username.trim().toLowerCase())
    if (bu) {
      const raw = localStorage.getItem(`liga-mx-data-${bu.id}`)
      bootstrap = { user: bu, data: raw ? JSON.parse(raw) : null }
    }
  } catch {}
  const r = await callAuth({ action: 'login', username, password, bootstrap })
  if (r.token) setToken(r.token)
  return r
}

export async function authRegister(username, name, password) {
  const r = await callAuth({ action: 'register', username, name, password })
  if (r.token) setToken(r.token)
  return r
}

export async function authVerify() {
  const token = getToken()
  if (!token) return null
  const r = await callAuth({ action: 'verify', token })
  if (r.user) return r.user
  clearToken()
  return null
}

export async function authUpdate(updates) {
  const token = getToken()
  if (!token) return { error: 'Sesión inválida.' }
  return callAuth({ action: 'update', token, updates })
}

export async function loadData() {
  const token = getToken()
  if (!token) return null
  try {
    const r = await fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export async function saveData(data) {
  const token = getToken()
  if (!token) return
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  } catch {}
}
