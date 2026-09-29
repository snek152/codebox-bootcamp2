import { useState } from 'react'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { getToken, clearToken } from './api/client.js'

export default function App() {
  const [view, setView] = useState(getToken() ? 'dashboard' : 'login')

  function handleAuthed() {
    setView('dashboard')
  }

  function handleLogout() {
    clearToken()
    setView('login')
  }

  if (view === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />
  }

  return <Auth initialMode={view === 'signup' ? 'signup' : 'login'} onAuthed={handleAuthed} />
}
