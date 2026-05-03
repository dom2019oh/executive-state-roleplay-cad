'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

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
    <div className="flex flex-col gap-6">
      <h1 className="page-title">BOLOs</h1>
      <div className="card">
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : bolos.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No active BOLOs.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Number</th><th>Type</th><th>Description</th><th>Reason</th><th>Last Known Location</th><th>Priority</th><th>Issued</th></tr>
              </thead>
              <tbody>
                {bolos.map((b) => {
                  const pColor = PRIORITY_COLORS[b.priority] ?? 'var(--text-muted)'
                  return (
                    <tr key={b.id}>
                      <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{b.boloNumber}</td>
                      <td>{b.type}</td>
                      <td style={{ maxWidth: 200 }}>{b.description}</td>
                      <td>{b.reason}</td>
                      <td>{b.lastKnownLocation || '—'}</td>
                      <td>
                        <span className="badge" style={{ background: pColor + '22', color: pColor }}>{b.priority}</span>
                      </td>
                      <td>{new Date(b.issuedAt).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
