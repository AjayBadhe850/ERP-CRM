import React, { useEffect, useState } from 'react'
import api from '../api'

const emptyForm = {
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 5,
    location: ''
  }

export default function ProductForm({ onSaved, product, onCancel }: any){
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        unitPrice: Number(product.unitPrice) || 0,
        currentStock: Number(product.currentStock) || 0,
        minStockAlert: Number(product.minStockAlert) || 0,
        location: product.location || ''
      })
      setError('')
      return
    }

    setFormData(emptyForm)
  }, [product])

  async function submit(e: React.FormEvent){
    e.preventDefault()
    if (!formData.name || !formData.sku) {
      setError('Name and SKU are required')
      return
    }
    setError('')
    setLoading(true)
    try{
      if (product?.id) {
        await api.put(`/products/${product.id}`, formData)
      } else {
        await api.post('/products', formData)
      }
      setFormData(emptyForm)
      onSaved && onSaved()
      onCancel && onCancel()
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
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ margin: 0 }}>{product ? 'Edit Product' : 'Add Product'}</h3>
        {product && (
          <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
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

      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Location</label>
      <input name="location" placeholder="Warehouse location" value={formData.location} onChange={handleChange} />

      <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  )
}
