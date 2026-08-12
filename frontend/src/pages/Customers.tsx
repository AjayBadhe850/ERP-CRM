import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import CustomerForm from './CustomerForm'

export default function Customers(){
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingCustomer, setEditingCustomer] = useState<any>(null)

  async function load(){
    setLoading(true)
    try{
      const res = await api.get(`/customers?search=${search}`)
      setData(res.data.data)
    }catch(e){console.error(e)}
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Customers</h1>
        <div className="flex gap-2">
          <input 
            placeholder="Search customers..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && load()}
            style={{ width: 240, marginBottom: 0 }}
          />
          <button className="primary" onClick={load}>Search</button>
          <button className="secondary" onClick={() => setEditingCustomer(null)}>Add Customer</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Business</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No customers found.</td></tr>
              ) : (
                data.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.mobile}</div>
                    </td>
                    <td>{c.businessName || '-'}</td>
                    <td>{c.customerType}</td>
                    <td>
                      <span className={`badge badge-${c.status === 'Active' ? 'success' : c.status === 'Lead' ? 'info' : 'warning'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                        <button className="secondary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setEditingCustomer(c)}>Edit Customer</button>
                        <Link to={`/customers/${c.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>View Details &rarr;</Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div>
          <CustomerForm
            onSaved={load}
            customer={editingCustomer}
            onCancel={() => setEditingCustomer(null)}
          />
        </div>
      </div>
    </div>
  )
}
