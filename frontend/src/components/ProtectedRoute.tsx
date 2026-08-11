import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }){
  const { state } = useAuth()
  
  // Wait for auth initialization from localStorage
  if (state.token === null && localStorage.getItem('token')) {
    return <div>Loading...</div>
  }

  if (!state.token && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
