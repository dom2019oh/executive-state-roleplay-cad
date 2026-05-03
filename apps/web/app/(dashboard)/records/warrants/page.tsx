'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function WarrantsPage() {
  const [warrants, setWarrants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ warrants: any[] }>('/records/warrants').then((d) => setWarrants(d.warrants)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">Warrants</h1>
        <Link
          href="/records/warrants/new"
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
          New Warrant
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
        ) : warrants.length === 0 ? (
          <div style={{ padding: '48px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
            No active warrants.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Number</th><th>Type</th><th>Reason</th><th>Status</th><th>Issued</th><th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {warrants.map((w) => (
                <tr key={w.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{w.warrantNumber}</td>
                  <td>{w.type}</td>
                  <td>{w.reason}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: w.status === 'active' ? '#3f1414' : 'var(--bg-elevated)',
                      color: w.status === 'active' ? 'var(--danger)' : 'var(--text-muted)',
                      border: `1px solid ${w.status === 'active' ? '#7f282844' : 'var(--border)'}`,
                    }}>
                      {w.status}
                    </span>
                  </td>
                  <td>{new Date(w.issuedAt).toLocaleDateString()}</td>
                  <td>{w.expiresAt ? new Date(w.expiresAt).toLocaleDateString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
