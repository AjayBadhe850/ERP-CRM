import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function ChallanDetails() {
  const { id } = useParams()
  const [challan, setChallan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await api.get(`/challans/${id}`)
      setChallan(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function confirm() {
    if (!window.confirm('Confirm this challan? This will reduce stock and cannot be undone.')) return
    try {
      await api.post(`/challans/${id}/confirm`)
      load()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Confirmation failed')
    }
  }

  async function cancel() {
    if (!window.confirm('Cancel this draft challan?')) return
    try {
      await api.post(`/challans/${id}/cancel`)
      load()
    } catch (e) {
      alert('Cancellation failed')
    }
  }

  if (loading) return <div>Loading...</div>
  if (!challan) return <div>Challan not found</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Link to="/challans" style={{ color: 'var(--primary)', textDecoration: 'none' }}>&larr; Back to Challans</Link>
        <div className="flex gap-2">
          {challan.status === 'Draft' && (
            <>
              <button className="primary" onClick={confirm}>Confirm Challan</button>
              <button className="secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={cancel}>Cancel Draft</button>
            </>
          )}
          <span className={`badge badge-${challan.status === 'Confirmed' ? 'success' : challan.status === 'Draft' ? 'warning' : 'danger'}`}>
            {challan.status}
          </span>
        </div>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div className="card">
          <h3 className="mb-4">Challan Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px 16px', fontSize: 14 }}>
            <div style={{ color: 'var(--text-muted)' }}>Number:</div>
            <div style={{ fontWeight: 600 }}>{challan.challanNumber}</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Date:</div>
            <div>{new Date(challan.createdAt).toLocaleDateString()}</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Customer:</div>
            <div>
              <Link to={`/customers/${challan.customer?.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                {challan.customer?.name}
              </Link>
            </div>

            <div style={{ color: 'var(--text-muted)' }}>Business:</div>
            <div>{challan.customer?.businessName || '-'}</div>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th className="text-right">Price</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td><code style={{ fontSize: 12 }}>{item.sku}</code></td>
                  <td className="text-right">${Number(item.unitPrice).toFixed(2)}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right" style={{ fontWeight: 600 }}>
                    ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={3} className="text-right">Total Quantity</th>
                <th className="text-right">{challan.totalQuantity}</th>
                <th className="text-right"></th>
              </tr>
              <tr>
                <th colSpan={4} className="text-right">Grand Total</th>
                <th className="text-right" style={{ color: 'var(--primary)', fontSize: 18 }}>
                  ${challan.items.reduce((s: number, i: any) => s + (Number(i.unitPrice) * i.quantity), 0).toFixed(2)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
