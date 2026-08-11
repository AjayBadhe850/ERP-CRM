import React, { useState } from 'react'
import api from '../api'

export default function CustomerForm({ onSaved }: any){
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    customerType: 'Retail',
    status: 'Lead',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent){
    e.preventDefault()
    if (!formData.name || !formData.mobile) {
      setError('Name and Mobile are required')
      return
    }
    setError('')
    setLoading(true)
    try{
      await api.post('/customers', formData)
      setFormData({
        name: '', mobile: '', email: '', businessName: '',
        customerType: 'Retail', status: 'Lead', address: ''
      })
      onSaved && onSaved()
    }catch(e:any){ 
      setError(e?.response?.data?.message || 'Error saving customer')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <form onSubmit={submit} className="card">
      <h3 className="mb-4">New Customer</h3>
      {error && <div className="error mb-4">{error}</div>}
      
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customer Name*</label>
      <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
      
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mobile Number*</label>
      <input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} />
      
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Business Name</label>
      <input name="businessName" placeholder="Company Name" value={formData.businessName} onChange={handleChange} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Type</label>
          <select name="customerType" value={formData.customerType} onChange={handleChange}>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Saving...' : 'Create Customer'}
      </button>
    </form>
  )
}
