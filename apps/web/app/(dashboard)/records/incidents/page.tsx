'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ incidents: any[] }>('/records/incidents').then((d) => setIncidents(d.incidents)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">Incidents</h1>
        <Link
          href="/records/incidents/new"
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
          New Incident
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
        ) : incidents.length === 0 ? (
          <div style={{ padding: '48px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
            No incident records.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Number</th><th>Title</th><th>Type</th><th>Location</th><th>Department</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{inc.incidentNumber}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{inc.title}</td>
                  <td>{inc.type}</td>
                  <td>{inc.location}</td>
                  <td>{inc.department}</td>
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
                      {inc.status}
                    </span>
                  </td>
                  <td>{new Date(inc.incidentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
