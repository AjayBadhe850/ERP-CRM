import React, { useState } from 'react'
import api from '../api'

export default function ProductForm({ onSaved }: any){
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 5,
    location: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent){
    e.preventDefault()
    if (!formData.name || !formData.sku) {
      setError('Name and SKU are required')
      return
    }
    setError('')
    setLoading(true)
    try{
      await api.post('/products', formData)
      setFormData({
        name: '', sku: '', category: '', unitPrice: 0,
        currentStock: 0, minStockAlert: 5, location: ''
      })
      onSaved && onSaved()
    }catch(e:any){ 
      setError(e?.response?.data?.message || 'Error saving product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  return (
    <form onSubmit={submit} className="card">
      <h3 className="mb-4">New Product</h3>
      {error && <div className="error mb-4">{error}</div>}
      
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Product Name*</label>
      <input name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} />
      
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>SKU*</label>
      <input name="sku" placeholder="Unique SKU" value={formData.sku} onChange={handleChange} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unit Price</label>
          <input name="unitPrice" type="number" step="0.01" value={formData.unitPrice} onChange={handleChange} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Category</label>
          <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Initial Stock</label>
          <input name="currentStock" type="number" value={formData.currentStock} onChange={handleChange} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Min Alert Qty</label>
          <input name="minStockAlert" type="number" value={formData.minStockAlert} onChange={handleChange} />
        </div>
      </div>

      <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Saving...' : 'Create Product'}
      </button>
    </form>
  )
}
