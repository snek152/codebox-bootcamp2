const BASE_URL = 'http://localhost:3000/api'
const TOKEN_KEY = 'questly_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?')
  }

  const isNoContent = res.status === 204
  const data = isNoContent ? null : await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`)
  }

  return data
}

export async function signup(username, password) {
  const data = await request('/auth/signup', { method: 'POST', body: { username, password } })
  setToken(data.token)
  return data
}

export async function login(username, password) {
  const data = await request('/auth/login', { method: 'POST', body: { username, password } })
  setToken(data.token)
  return data
}

export function getMe() {
  return request('/me', { auth: true })
}

export function getQuests() {
  return request('/quests', { auth: true })
}

export function createQuest({ title, description, difficulty }) {
  return request('/quests', { method: 'POST', auth: true, body: { title, description, difficulty } })
}

export function updateQuest(id, patch) {
  return request(`/quests/${id}`, { method: 'PUT', auth: true, body: patch })
}

export function deleteQuest(id) {
  return request(`/quests/${id}`, { method: 'DELETE', auth: true })
}
