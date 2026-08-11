import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function CustomerDetails() {
  const { id } = useParams()
  const [customer, setCustomer] = useState<any>(null)
  const [note, setNote] = useState('')
  const [followupDate, setFollowupDate] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await api.get(`/customers/${id}`)
      setCustomer(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function addFollowup(e: React.FormEvent) {
    e.preventDefault()
    if (!note) return
    try {
      await api.post(`/customers/${id}/followups`, { note, followupDate })
      setNote('')
      setFollowupDate('')
      load()
    } catch (e) {
      alert('Failed to add follow-up')
    }
  }

  if (loading) return <div>Loading...</div>
  if (!customer) return <div>Customer not found</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Link to="/customers" style={{ color: 'var(--primary)', textDecoration: 'none' }}>&larr; Back to Customers</Link>
        <div className="flex gap-2">
          <span className={`badge badge-${customer.status === 'Active' ? 'success' : customer.status === 'Lead' ? 'info' : 'warning'}`}>
            {customer.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div className="card">
            <h2 className="mb-4">{customer.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', fontSize: 14 }}>
              <div style={{ color: 'var(--text-muted)' }}>Business:</div>
              <div style={{ fontWeight: 500 }}>{customer.businessName || 'N/A'}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>Type:</div>
              <div>{customer.customerType}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>Mobile:</div>
              <div>{customer.mobile}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>Email:</div>
              <div>{customer.email || 'N/A'}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>GST:</div>
              <div>{customer.gstNumber || 'N/A'}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>Address:</div>
              <div>{customer.address || 'N/A'}</div>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-4">Add Follow-up</h3>
            <form onSubmit={addFollowup}>
              <textarea 
                placeholder="Follow-up notes..." 
                value={note} 
                onChange={e => setNote(e.target.value)}
                style={{ height: 100 }}
              />
              <div className="flex gap-4 items-center">
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Next Follow-up Date</label>
                  <input type="date" value={followupDate} onChange={e => setFollowupDate(e.target.value)} />
                </div>
                <button type="submit" className="primary" style={{ height: 42 }}>Add Note</button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Follow-up History</h3>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {customer.followups?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No follow-up history yet.</p>
            ) : (
              customer.followups.map((f: any) => (
                <div key={f.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-start">
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{new Date(f.createdAt).toLocaleDateString()}</div>
                    {f.followupDate && (
                      <div className="badge badge-info" style={{ fontSize: 10 }}>Next: {new Date(f.followupDate).toLocaleDateString()}</div>
                    )}
                  </div>
                  <p style={{ fontSize: 14, margin: '4px 0', color: 'var(--text-main)' }}>{f.note}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
