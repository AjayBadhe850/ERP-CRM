import React, { createContext, useContext, useEffect, useState } from 'react'
import { setToken as setApiToken } from './api'

type AuthState = { token: string | null, user?: any }

const AuthContext = createContext<{ state: AuthState, setToken: (t: string|null)=>void }>({ state: { token: null }, setToken: ()=>{} })

function parseJwt(token: string | null) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (e) {
    return null
  }
}

export const AuthProvider = ({ children }: any) => {
  const [state, setState] = useState<AuthState>({ token: null, user: undefined })

  useEffect(()=>{
    const t = localStorage.getItem('token')
    if (t) {
      setState({ token: t, user: parseJwt(t) })
      setApiToken(t)
    }
  },[])

  function setToken(t: string|null){
    if (t) {
      localStorage.setItem('token', t)
      setApiToken(t)
      setState({ token: t, user: parseJwt(t) })
    } else {
      localStorage.removeItem('token')
      setApiToken(null)
      setState({ token: null, user: undefined })
    }
  }

  return <AuthContext.Provider value={{ state, setToken }}>{children}</AuthContext.Provider>
}

export const useAuth = ()=> useContext(AuthContext)
