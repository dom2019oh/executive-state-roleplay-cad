'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function WarrantsPage() {
  const [warrants, setWarrants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ warrants: any[] }>('/records/warrants').then((d) => setWarrants(d.warrants)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="page-title">Warrants</h1>
      <div className="card">
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : warrants.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No active warrants.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Number</th><th>Type</th><th>Reason</th><th>Status</th><th>Issued</th><th>Expires</th></tr>
              </thead>
              <tbody>
                {warrants.map((w) => (
                  <tr key={w.id}>
                    <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{w.warrantNumber}</td>
                    <td>{w.type}</td>
                    <td>{w.reason}</td>
                    <td>
                      <span className="badge" style={{ background: w.status === 'active' ? '#3f1414' : 'var(--bg-elevated)', color: w.status === 'active' ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {w.status}
                      </span>
                    </td>
                    <td>{new Date(w.issuedAt).toLocaleDateString()}</td>
                    <td>{w.expiresAt ? new Date(w.expiresAt).toLocaleDateString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
