import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '@fontsource/space-grotesk/latin-400.css'
import '@fontsource/space-grotesk/latin-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/patrick-hand/latin-400.css'
import './styles/base.css'
import App from './App'

const container = document.getElementById('root')
if (!container) throw new Error('missing #root')

createRoot(container).render(
  <>
    <App />
    <Analytics />
  </>
)
