import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Dashboard(){
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/dashboard/stats')
        setStats(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div>
      <header className="mb-4">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back! Here is what's happening today.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats?.totalCustomers || 0}</div>
          <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>{stats?.activeCustomers || 0} Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats?.totalProducts || 0}</div>
          {stats?.lowStockProducts > 0 && (
            <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{stats.lowStockProducts} Low Stock Items</div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Draft Challans</div>
          <div className="stat-value">{stats?.draftChallans || 0}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Pending Confirmation</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed Challans</div>
          <div className="stat-value">{stats?.confirmedChallans || 0}</div>
          <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>Completed Sales</div>
        </div>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 className="mb-4">Quick Actions</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="primary" onClick={() => window.location.href='/challans'}>Create New Challan</button>
            <button className="secondary" onClick={() => window.location.href='/customers'}>Add Customer</button>
          </div>
        </div>
        <div className="card">
          <h3 className="mb-4">System Status</h3>
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></div>
            <span style={{ fontSize: 14 }}>API Connected</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></div>
            <span style={{ fontSize: 14 }}>Database Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}
