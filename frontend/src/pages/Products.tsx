import React, { useEffect, useState } from 'react'
import api from '../api'
import ProductForm from './ProductForm'

export default function Products(){
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<any>(null)

  async function load(){
    setLoading(true)
    try{
      const res = await api.get(`/products?search=${search}`)
      setData(res.data.data)
    }catch(e){console.error(e)}
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Products</h1>
        <div className="flex gap-2">
          <input 
            placeholder="Search by name or SKU..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && load()}
            style={{ width: 240, marginBottom: 0 }}
          />
          <button className="primary" onClick={load}>Search</button>
          <button className="secondary" onClick={() => setEditingProduct(null)}>Add Product</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th className="text-right">Price</th>
                <th className="text-right">Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No products found.</td></tr>
              ) : (
                data.map(p => (
                  <tr key={p.id}>
                    <td><div style={{ fontWeight: 600 }}>{p.name}</div></td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: 4 }}>{p.sku}</code></td>
                    <td>{p.category || '-'}</td>
                    <td className="text-right">${Number(p.unitPrice).toFixed(2)}</td>
                    <td className="text-right">
                      <span style={{ 
                        fontWeight: 700, 
                        color: p.currentStock < p.minStockAlert ? 'var(--danger)' : 'var(--text-main)' 
                      }}>
                        {p.currentStock}
                      </span>
                      {p.currentStock < p.minStockAlert && (
                        <div style={{ fontSize: 10, color: 'var(--danger)' }}>Low Stock</div>
                      )}
                    </td>
                    <td>
                      <button type="button" className="secondary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setEditingProduct(p)}>Edit Product</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div>
          <ProductForm
            onSaved={load}
            product={editingProduct}
            onCancel={() => setEditingProduct(null)}
          />
        </div>
      </div>
    </div>
  )
}
