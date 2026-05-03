'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function CitationsPage() {
  const [citations, setCitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ citations: any[] }>('/records/citations').then((d) => setCitations(d.citations)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="page-title">Citations</h1>
      <div className="card">
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : citations.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No citation records.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Number</th><th>Type</th><th>Location</th><th>Violations</th><th>Fine</th><th>Points</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {citations.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{c.citationNumber}</td>
                    <td>{c.type}</td>
                    <td>{c.location}</td>
                    <td>{c.violations?.length ?? 0}</td>
                    <td>${c.totalFine?.toLocaleString()}</td>
                    <td>{c.totalPoints ?? 0}</td>
                    <td><span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{c.status}</span></td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
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
