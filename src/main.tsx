import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DashboardLayout from './Layout/DashboardLayout'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DashboardLayout />
  </StrictMode>,
)
