const BASE = 'http://localhost:3000/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

let onUnauthorized = null
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

function getToken() {
  return localStorage.getItem('signal_token')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new ApiError('Cannot reach the Signal API. Is the backend running?', 0)
  }
  if (res.status === 401 && auth) {
    onUnauthorized?.()
  }
  if (res.status === 204) return null
  let data = null
  try {
    data = await res.json()
  } catch {
    // no body
  }
  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status)
  }
  return data
}

export const signup = (username, password) =>
  request('/auth/signup', { method: 'POST', body: { username, password }, auth: false })

export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: { username, password }, auth: false })

export const me = () => request('/me')

export const listMonitors = () => request('/monitors')

export const createMonitor = (payload) => request('/monitors', { method: 'POST', body: payload })

export const updateMonitor = (id, payload) =>
  request(`/monitors/${id}`, { method: 'PUT', body: payload })

export const deleteMonitor = (id) => request(`/monitors/${id}`, { method: 'DELETE' })

export const listChecks = (id, limit = 100) => request(`/monitors/${id}/checks?limit=${limit}`)

export const checkNow = (id) => request(`/monitors/${id}/check`, { method: 'POST' })

export const streamUrl = (token) => `${BASE}/stream?token=${encodeURIComponent(token)}`

export { ApiError }
