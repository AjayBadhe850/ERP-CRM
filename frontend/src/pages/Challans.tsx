import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import ChallanForm from './ChallanForm'

export default function Challans(){
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load(){
    setLoading(true)
    try{
      const res = await api.get('/challans')
      setData(res.data.data)
    }catch(e){console.error(e)}
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Sales Challans</h1>
        <button className="secondary" onClick={load}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Date</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No challans found.</td></tr>
              ) : (
                data.map(c => (
                  <tr key={c.id}>
                    <td><div style={{ fontWeight: 600 }}>{c.challanNumber}</div></td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{c.totalQuantity}</td>
                    <td>
                      <span className={`badge badge-${c.status === 'Confirmed' ? 'success' : c.status === 'Draft' ? 'warning' : 'danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/challans/${c.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>View &rarr;</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div>
          <ChallanForm onSaved={load} />
        </div>
      </div>
    </div>
  )
}
