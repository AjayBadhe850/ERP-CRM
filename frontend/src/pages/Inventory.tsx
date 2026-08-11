import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Inventory() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await api.get('/stock-movements')
      setData(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div>Loading movements...</div>

  return (
    <div>
      <h1 className="mb-4">Stock Movements</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No stock movements recorded.</td></tr>
            ) : (
              data.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>{m.product.name}</td>
                  <td><code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: 4 }}>{m.product.sku}</code></td>
                  <td>
                    <span className={`badge badge-${m.movementType === 'IN' ? 'success' : 'danger'}`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                  <td>{m.reason || '-'}</td>
                  <td>{m.user?.name || 'System'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
