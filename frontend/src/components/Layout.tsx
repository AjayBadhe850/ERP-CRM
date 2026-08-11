import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Layout({ children }: { children: React.ReactNode }){
  const { state, setToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const role = state.user?.role

  function logout(){
    setToken(null)
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/', roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
    { label: 'Customers', path: '/customers', roles: ['Admin', 'Sales'] },
    { label: 'Products', path: '/products', roles: ['Admin', 'Warehouse', 'Sales'] },
    { label: 'Inventory', path: '/inventory', roles: ['Admin', 'Warehouse', 'Accounts'] },
    { label: 'Challans', path: '/challans', roles: ['Admin', 'Sales', 'Accounts', 'Warehouse'] },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>E</div>
          <span>Operations Portal</span>
        </div>
        
        <nav style={{ flex: 1, marginTop: 20 }}>
          {navItems.filter(item => item.roles.includes(role)).map(item => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, color: 'var(--sidebar-text)' }}>Signed in as</div>
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: 12 }}>{state.user?.name || 'User'}</div>
          <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', marginBottom: 16 }}>{role}</div>
          <button onClick={logout} className="secondary" style={{ width: '100%', padding: '8px', fontSize: 13, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  )
}
