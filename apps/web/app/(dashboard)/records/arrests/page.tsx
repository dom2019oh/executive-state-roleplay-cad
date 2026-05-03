'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function ArrestsPage() {
  const [arrests, setArrests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ arrests: any[] }>('/records/arrests').then((d) => setArrests(d.arrests)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Arrests</h1>
        <Link href="/records/arrests/new" className="py-2 px-4 rounded-lg font-semibold text-sm text-white" style={{ background: 'var(--accent)' }}>
          + New Arrest
        </Link>
      </div>
      <div className="card">
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : arrests.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No arrest records.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Number</th><th>Location</th><th>Charges</th><th>Total Fine</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {arrests.map((a) => (
                  <tr key={a.id}>
                    <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{a.arrestNumber}</td>
                    <td>{a.location}</td>
                    <td>{a.charges?.length ?? 0} charge{a.charges?.length !== 1 ? 's' : ''}</td>
                    <td>${a.totalFine?.toLocaleString()}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{a.status}</span>
                    </td>
                    <td>{new Date(a.arrestDate).toLocaleDateString()}</td>
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
