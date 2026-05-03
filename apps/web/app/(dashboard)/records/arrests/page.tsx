'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function ArrestsPage() {
  const [arrests, setArrests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ arrests: any[] }>('/records/arrests').then((d) => setArrests(d.arrests)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">Arrests</h1>
        <Link
          href="/records/arrests/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            background: 'var(--success)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <Plus size={14} />
          New Arrest Report
        </Link>
      </div>

      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: 32, color: 'var(--text-muted)', textAlign: 'center' }}>Loading…</div>
        ) : arrests.length === 0 ? (
          <div style={{ padding: '48px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
            No arrest records.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Number</th><th>Location</th><th>Charges</th><th>Total Fine</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {arrests.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{a.arrestNumber}</td>
                  <td>{a.location}</td>
                  <td>{a.charges?.length ?? 0} charge{a.charges?.length !== 1 ? 's' : ''}</td>
                  <td>${a.totalFine?.toLocaleString()}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}>
                      {a.status}
                    </span>
                  </td>
                  <td>{new Date(a.arrestDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
