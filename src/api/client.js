let _token = null

export const getToken   = () => _token
export const setToken   = t  => { _token = t }
export const clearToken = () => { _token = null }

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
  const r = await callAuth({ action: 'login', username, password })
  if (r.token) setToken(r.token)
  return r
}

export async function authRegister(username, name, password) {
  const r = await callAuth({ action: 'register', username, name, password })
  if (r.token) setToken(r.token)
  return r
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
