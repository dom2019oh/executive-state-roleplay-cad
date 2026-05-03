'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  extreme: '#dc2626',
}

export default function BolosPage() {
  const [bolos, setBolos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ bolos: any[] }>('/records/bolos').then((d) => setBolos(d.bolos)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">BOLOs</h1>
        <Link
          href="/records/bolos/new"
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
          New BOLO
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
        ) : bolos.length === 0 ? (
          <div style={{ padding: '48px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
            No active BOLOs.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Number</th><th>Type</th><th>Description</th><th>Reason</th><th>Last Known Location</th><th>Priority</th><th>Issued</th>
              </tr>
            </thead>
            <tbody>
              {bolos.map((b) => {
                const pColor = PRIORITY_COLORS[b.priority] ?? 'var(--text-muted)'
                return (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{b.boloNumber}</td>
                    <td>{b.type}</td>
                    <td style={{ maxWidth: 200 }}>{b.description}</td>
                    <td>{b.reason}</td>
                    <td>{b.lastKnownLocation || '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: pColor + '22',
                        color: pColor,
                        border: `1px solid ${pColor}44`,
                      }}>
                        {b.priority}
                      </span>
                    </td>
                    <td>{new Date(b.issuedAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
