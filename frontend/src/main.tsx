import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetails from './pages/CustomerDetails'
import Products from './pages/Products'
import Challans from './pages/Challans'
import ChallanDetails from './pages/ChallanDetails'
import Inventory from './pages/Inventory'
import './styles.css'
import { AuthProvider } from './auth'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>} />
          
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
          
          <Route path="/customers" element={<ProtectedRoute><Layout><Customers/></Layout></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute><Layout><CustomerDetails/></Layout></ProtectedRoute>} />
          
          <Route path="/products" element={<ProtectedRoute><Layout><Products/></Layout></ProtectedRoute>} />
          
          <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory/></Layout></ProtectedRoute>} />
          
          <Route path="/challans" element={<ProtectedRoute><Layout><Challans/></Layout></ProtectedRoute>} />
          <Route path="/challans/:id" element={<ProtectedRoute><Layout><ChallanDetails/></Layout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
