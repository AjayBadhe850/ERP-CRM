import React, { useEffect, useState } from 'react'
import api from '../api'

export default function ChallanForm({ onSaved }: any){
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<{productId:string, quantity:number}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100')
        ])
        setCustomers(cRes.data.data)
        setProducts(pRes.data.data)
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [])

  const addLine = () => {
    if (products.length === 0) return
    setItems([...items, { productId: products[0].id, quantity: 1 }])
  }

  const removeLine = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateLine = (idx: number, field: string, val: any) => {
    const copy = [...items]
    ;(copy[idx] as any)[field] = val
    setItems(copy)
  }

  async function submit(e: React.FormEvent){
    e.preventDefault()
    if (!customerId) return setError('Customer is required')
    if (items.length === 0) return setError('Add at least one product')
    if (items.some(i => i.quantity <= 0)) return setError('Quantity must be positive')
    
    setError('')
    setLoading(true)
    try {
      await api.post('/challans', { customerId, items })
      setCustomerId('')
      setItems([])
      onSaved && onSaved()
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error creating challan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3 className="mb-4">Create Sales Challan</h3>
      {error && <div className="error mb-4">{error}</div>}
      
      <form onSubmit={submit}>
        <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customer</label>
        <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
          <option value="">-- Select Customer --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.businessName || 'No Business'})</option>)}
        </select>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Products</label>
            <button type="button" onClick={addLine} style={{ padding: '4px 8px', fontSize: 12 }} className="secondary">+ Add</button>
          </div>
          
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <select 
                value={it.productId} 
                onChange={e => updateLine(idx, 'productId', e.target.value)}
                style={{ flex: 2, marginBottom: 0 }}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                ))}
              </select>
              <input 
                type="number" 
                value={it.quantity} 
                onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} 
                style={{ flex: 1, width: 60, marginBottom: 0 }} 
              />
              <button 
                type="button" 
                onClick={() => removeLine(idx)} 
                style={{ padding: '4px 8px', color: 'var(--danger)', background: 'transparent' }}
              >
                &times;
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: 12, border: '1px dashed var(--border)', borderRadius: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              No items added.
            </div>
          )}
        </div>

        <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Processing...' : 'Save as Draft'}
        </button>
      </form>
    </div>
  )
}
