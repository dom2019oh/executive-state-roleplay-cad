'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ incidents: any[] }>('/records/incidents').then((d) => setIncidents(d.incidents)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="page-title">Incidents</h1>
      <div className="card">
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : incidents.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No incident records.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Number</th><th>Title</th><th>Type</th><th>Location</th><th>Department</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{inc.incidentNumber}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{inc.title}</td>
                    <td>{inc.type}</td>
                    <td>{inc.location}</td>
                    <td>{inc.department}</td>
                    <td><span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{inc.status}</span></td>
                    <td>{new Date(inc.incidentDate).toLocaleDateString()}</td>
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
