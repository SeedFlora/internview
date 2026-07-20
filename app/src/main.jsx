import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserProvider } from '@/context/userContext.jsx'

import './index.css'
import { App } from './App.jsx'

localStorage.removeItem('admin_user_management_users_v1')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
)
