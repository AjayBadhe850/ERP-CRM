import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import jsPDF from 'jspdf'
import api from '../api'

export default function ChallanDetails() {
  const { id } = useParams()
  const [challan, setChallan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await api.get('/challans/' + id)
      setChallan(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function confirm() {
    if (
      !window.confirm(
        'Confirm this challan? This will reduce stock and cannot be undone.'
      )
    ) {
      return
    }

    try {
      await api.post('/challans/' + id + '/confirm')
      load()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Confirmation failed')
    }
  }

  async function cancel() {
    if (!window.confirm('Cancel this draft challan?')) {
      return
    }

    try {
      await api.post('/challans/' + id + '/cancel')
      load()
    } catch (e) {
      alert('Cancellation failed')
    }
  }

  function exportPDF() {
    if (!challan) {
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    const grandTotal = challan.items.reduce(
      (sum: number, item: any) =>
        sum + Number(item.unitPrice) * Number(item.quantity),
      0
    )

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('SALES CHALLAN', pageWidth / 2, 20, {
      align: 'center'
    })

    // Challan information
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    doc.text(
      'Challan No: ' + challan.challanNumber,
      20,
      35
    )

    doc.text(
      'Date: ' +
        new Date(challan.createdAt).toLocaleDateString(),
      20,
      42
    )

    doc.text(
      'Status: ' + challan.status,
      20,
      49
    )

    // Customer information
    doc.setFont('helvetica', 'bold')
    doc.text('Customer Details', 20, 63)

    doc.setFont('helvetica', 'normal')

    doc.text(
      'Name: ' + (challan.customer?.name || '-'),
      20,
      71
    )

    doc.text(
      'Business: ' +
        (challan.customer?.businessName || '-'),
      20,
      78
    )

    // Table header
    let y = 92

    doc.setFont('helvetica', 'bold')

    doc.text('Product', 20, y)
    doc.text('SKU', 75, y)
    doc.text('Price', 115, y)
    doc.text('Qty', 145, y)
    doc.text('Total', 175, y)

    doc.line(20, y + 3, 190, y + 3)

    // Items
    doc.setFont('helvetica', 'normal')
    y += 12

    challan.items.forEach((item: any) => {
      const itemTotal =
        Number(item.unitPrice) * Number(item.quantity)

      doc.text(
        String(item.productName || '-'),
        20,
        y
      )

      doc.text(
        String(item.sku || '-'),
        75,
        y
      )

      doc.text(
        '$' + Number(item.unitPrice).toFixed(2),
        110,
        y
      )

      doc.text(
        String(item.quantity),
        145,
        y
      )

      doc.text(
        '$' + itemTotal.toFixed(2),
        170,
        y
      )

      y += 9

      // Add a new page if necessary
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })

    doc.line(20, y, 190, y)

    // Total quantity
    y += 10

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)

    doc.text('Total Quantity:', 120, y)

    doc.text(
      String(challan.totalQuantity),
      175,
      y
    )

    // Grand total
    y += 10

    doc.setFontSize(13)

    doc.text('Grand Total:', 120, y)

    doc.text(
      '$' + grandTotal.toFixed(2),
      170,
      y
    )

    // Footer
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    doc.text(
      'Generated from Mini ERP + CRM Operations Portal',
      pageWidth / 2,
      285,
      {
        align: 'center'
      }
    )

    // Download PDF
    doc.save(
      'Challan-' + challan.challanNumber + '.pdf'
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!challan) {
    return <div>Challan not found</div>
  }

  return (
    <div>
      {/* Top section */}
      <div className="flex justify-between items-center mb-4">
        <Link
          to="/challans"
          style={{
            color: 'var(--primary)',
            textDecoration: 'none'
          }}
        >
          &larr; Back to Challans
        </Link>

        <div className="flex gap-2">
          {/* Export PDF */}
          <button
            className="secondary"
            onClick={exportPDF}
          >
            Export PDF
          </button>

          {/* Draft actions */}
          {challan.status === 'Draft' && (
            <>
              <button
                className="primary"
                onClick={confirm}
              >
                Confirm Challan
              </button>

              <button
                className="secondary"
                style={{
                  color: 'var(--danger)',
                  borderColor: 'var(--danger)'
                }}
                onClick={cancel}
              >
                Cancel Draft
              </button>
            </>
          )}

          {/* Status */}
          <span
            className={
              'badge badge-' +
              (
                challan.status === 'Confirmed'
                  ? 'success'
                  : challan.status === 'Draft'
                    ? 'warning'
                    : 'danger'
              )
            }
          >
            {challan.status}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 24
        }}
      >
        {/* Challan information */}
        <div className="card">
          <h3 className="mb-4">
            Challan Info
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr',
              gap: '12px 16px',
              fontSize: 14
            }}
          >
            <div
              style={{
                color: 'var(--text-muted)'
              }}
            >
              Number:
            </div>

            <div
              style={{
                fontWeight: 600
              }}
            >
              {challan.challanNumber}
            </div>

            <div
              style={{
                color: 'var(--text-muted)'
              }}
            >
              Date:
            </div>

            <div>
              {new Date(
                challan.createdAt
              ).toLocaleDateString()}
            </div>

            <div
              style={{
                color: 'var(--text-muted)'
              }}
            >
              Customer:
            </div>

            <div>
              <Link
                to={
                  '/customers/' +
                  challan.customer?.id
                }
                style={{
                  color: 'var(--primary)',
                  textDecoration: 'none'
                }}
              >
                {challan.customer?.name}
              </Link>
            </div>

            <div
              style={{
                color: 'var(--text-muted)'
              }}
            >
              Business:
            </div>

            <div>
              {challan.customer?.businessName || '-'}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <h3 className="mb-4">
            Items
          </h3>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th className="text-right">
                  Price
                </th>
                <th className="text-right">
                  Qty
                </th>
                <th className="text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {challan.items.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    {item.productName}
                  </td>

                  <td>
                    <code
                      style={{
                        fontSize: 12
                      }}
                    >
                      {item.sku}
                    </code>
                  </td>

                  <td className="text-right">
                    $
                    {Number(
                      item.unitPrice
                    ).toFixed(2)}
                  </td>

                  <td className="text-right">
                    {item.quantity}
                  </td>

                  <td
                    className="text-right"
                    style={{
                      fontWeight: 600
                    }}
                  >
                    $
                    {(
                      Number(item.unitPrice) *
                      Number(item.quantity)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              {/* Total quantity */}
              <tr>
                <th
                  colSpan={3}
                  className="text-right"
                >
                  Total Quantity
                </th>

                <th className="text-right">
                  {challan.totalQuantity}
                </th>

                <th className="text-right">
                </th>
              </tr>

              {/* Grand total */}
              <tr>
                <th
                  colSpan={4}
                  className="text-right"
                >
                  Grand Total
                </th>

                <th
                  className="text-right"
                  style={{
                    color: 'var(--primary)',
                    fontSize: 18
                  }}
                >
                  $
                  {challan.items
                    .reduce(
                      (
                        sum: number,
                        item: any
                      ) =>
                        sum +
                        Number(item.unitPrice) *
                          Number(item.quantity),
                      0
                    )
                    .toFixed(2)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
