import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/auth.css'
import AuthLayout from './components/AuthLayout'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Forgot from './pages/auth/Forgot'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthLayout/>}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="signup" element={<Signup/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
