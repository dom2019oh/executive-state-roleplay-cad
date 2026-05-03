'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function CitationsPage() {
  const [citations, setCitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ citations: any[] }>('/records/citations').then((d) => setCitations(d.citations)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">Citations</h1>
        <Link
          href="/records/citations/new"
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
          New Citation
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
        ) : citations.length === 0 ? (
          <div style={{ padding: '48px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
            No citation records.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Number</th><th>Type</th><th>Location</th><th>Violations</th><th>Fine</th><th>Points</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {citations.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{c.citationNumber}</td>
                  <td>{c.type}</td>
                  <td>{c.location}</td>
                  <td>{c.violations?.length ?? 0}</td>
                  <td>${c.totalFine?.toLocaleString()}</td>
                  <td>{c.totalPoints ?? 0}</td>
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
                      {c.status}
                    </span>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
