import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import './lib/i18n'
import App from './App'
import AdminPage from './pages/AdminPage'

const isAdmin =
  window.location.hash === '#admin' ||
  new URLSearchParams(window.location.search).has('admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <AdminPage /> : <App />}
  </StrictMode>,
)
