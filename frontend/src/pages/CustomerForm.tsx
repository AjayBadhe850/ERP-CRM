import React, { useEffect, useState } from 'react'
import api from '../api'

const emptyForm = {
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'Retail',
    status: 'Lead',
    address: '',
    followUpDate: '',
    notes: ''
  }

export default function CustomerForm({ onSaved, customer, onCancel }: any){
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        mobile: customer.mobile || '',
        email: customer.email || '',
        businessName: customer.businessName || '',
        gstNumber: customer.gstNumber || '',
        customerType: customer.customerType || 'Retail',
        status: customer.status || 'Lead',
        address: customer.address || '',
        followUpDate: customer.followUpDate ? String(customer.followUpDate).slice(0, 10) : '',
        notes: customer.notes || ''
      })
      setError('')
      return
    }

    setFormData(emptyForm)
  }, [customer])

  async function submit(e: React.FormEvent){
    e.preventDefault()
    if (!formData.name || !formData.mobile) {
      setError('Name and Mobile are required')
      return
    }
    setError('')
    setLoading(true)
    try{
      const payload = {
        ...formData,
        followUpDate: formData.followUpDate || null
      }
      if (customer?.id) {
        await api.put(`/customers/${customer.id}`, payload)
      } else {
        await api.post('/customers', payload)
      }
      setFormData(emptyForm)
      onSaved && onSaved()
      onCancel && onCancel()
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
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ margin: 0 }}>{customer ? 'Edit Customer' : 'Add Customer'}</h3>
        {customer && (
          <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
      {error && <div className="error mb-4">{error}</div>}
      
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customer Name*</label>
      <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
      
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mobile Number*</label>
      <input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} />
      
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Business Name</label>
      <input name="businessName" placeholder="Company Name" value={formData.businessName} onChange={handleChange} />

      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>GST Number</label>
      <input name="gstNumber" placeholder="GST Number" value={formData.gstNumber} onChange={handleChange} />

      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email</label>
      <input name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
      
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

      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Address</label>
      <textarea name="address" placeholder="Business address" value={formData.address} onChange={handleChange} style={{ minHeight: 84 }} />

      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Next Follow-up Date</label>
      <input name="followUpDate" type="date" value={formData.followUpDate} onChange={handleChange} />

      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Notes</label>
      <textarea name="notes" placeholder="Customer notes" value={formData.notes} onChange={handleChange} style={{ minHeight: 84 }} />

      <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
      </button>
    </form>
  )
}
