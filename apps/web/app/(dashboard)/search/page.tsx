'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'

interface Civilian {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: number
  gender: string
  flags: string[]
  driversLicense: { status: string; class: string; number: string }
}

interface Vehicle {
  id: string
  plate: string
  make: string
  model: string
  year: number
  color: string
  registrationStatus: string
  flags: string[]
  owner: Civilian | null
}

interface FullProfile {
  civilian: any
  vehicles: any[]
  warrants: any[]
  citations: any[]
  arrests: any[]
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | 'person' | 'vehicle'>('all')
  const [results, setResults] = useState<{ civilians: Civilian[]; vehicles: Vehicle[] } | null>(null)
  const [selected, setSelected] = useState<FullProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const debounce = useRef<NodeJS.Timeout | undefined>(undefined)

  async function search(q: string) {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const data = await api.get<{ civilians: Civilian[]; vehicles: Vehicle[] }>(
        `/search?q=${encodeURIComponent(q)}&type=${type}`
      )
      setResults(data)
    } catch {}
    setLoading(false)
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(q), 300)
  }

  async function selectCivilian(id: string) {
    setLoading(true)
    try {
      const data = await api.get<FullProfile>(`/civilians/${id}`)
      setSelected(data)
      setResults(null)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="page-title">Records Search</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          10-27 / 10-28 / 10-29 — Search civilians, vehicles, and warrants.
        </p>
      </div>

      <div className="card flex flex-col gap-3">
        <div className="flex gap-2">
          {(['all', 'person', 'vehicle'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="px-3 py-1 rounded text-xs font-semibold transition-all"
              style={{
                background: type === t ? 'var(--accent)' : 'var(--bg-elevated)',
                color: type === t ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {t === 'all' ? 'All' : t === 'person' ? 'Person' : 'Vehicle/Plate'}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={onInput}
          placeholder="Search by name, plate, or ID…"
          autoFocus
          style={{ fontSize: 15 }}
        />

        {loading && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Searching…</div>}

        {results && !loading && (
          <div className="flex flex-col gap-1">
            {results.civilians.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCivilian(c.id)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>👤</span>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>
                      {c.firstName} {c.lastName}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      DOB {new Date(c.dateOfBirth).toLocaleDateString()} · {c.gender}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {c.flags?.map((f) => (
                    <span key={f} className="badge" style={{ background: '#3f1414', color: '#fca5a5' }}>{f}</span>
                  ))}
                </div>
              </button>
            ))}

            {results.vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => v.owner && selectCivilian(v.owner.id)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🚗</span>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, fontFamily: 'monospace' }}>
                      {v.plate}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {v.year} {v.make} {v.model} · {v.color}
                      {v.owner ? ` · ${v.owner.firstName} ${v.owner.lastName}` : ''}
                    </div>
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background: v.registrationStatus === 'valid' ? '#16a34a22' : '#3f1414',
                    color: v.registrationStatus === 'valid' ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {v.registrationStatus}
                </span>
              </button>
            ))}

            {results.civilians.length === 0 && results.vehicles.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                No results found.
              </div>
            )}
          </div>
        )}
      </div>

      {selected && <ProfileView profile={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function ProfileView({ profile, onClose }: { profile: FullProfile; onClose: () => void }) {
  const c = profile.civilian
  const [tab, setTab] = useState<'info' | 'warrants' | 'citations' | 'arrests' | 'vehicles'>('info')
  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'warrants', label: `Warrants (${profile.warrants.length})` },
    { id: 'citations', label: `Citations (${profile.citations.length})` },
    { id: 'arrests', label: `Arrests (${profile.arrests.length})` },
    { id: 'vehicles', label: `Vehicles (${profile.vehicles.length})` },
  ] as const

  const activeWarrants = profile.warrants.filter((w) => w.status === 'active')

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
          >
            {c.firstName?.[0]}{c.lastName?.[0]}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {c.firstName} {c.lastName}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              DOB {new Date(c.dateOfBirth).toLocaleDateString()} · {c.gender} · {c.ethnicity}
            </div>
            <div className="flex gap-1 mt-1">
              {activeWarrants.length > 0 && (
                <span className="badge" style={{ background: '#3f1414', color: '#fca5a5' }}>
                  {activeWarrants.length} ACTIVE WARRANT{activeWarrants.length !== 1 ? 'S' : ''}
                </span>
              )}
              {c.flags?.map((f: string) => (
                <span key={f} className="badge" style={{ background: '#3f1414', color: '#fca5a5' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'transparent', fontSize: 18 }}>✕</button>
      </div>

      <div className="flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className="px-3 py-1 rounded text-xs font-semibold transition-all"
            style={{
              background: tab === t.id ? 'var(--accent)' : 'var(--bg-elevated)',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-3 gap-3">
          <Info label="Address" value={c.address || '—'} />
          <Info label="Phone" value={c.phone || '—'} />
          <Info label="Occupation" value={c.occupation || '—'} />
          <Info label="Height" value={c.height || '—'} />
          <Info label="Weight" value={c.weight || '—'} />
          <Info label="Eye Color" value={c.eyeColor || '—'} />
          <Info label="Hair Color" value={c.hairColor || '—'} />
          <Info label="DL Class" value={c.driversLicense?.class || '—'} />
          <Info label="DL Status" value={c.driversLicense?.status || '—'} />
          <Info label="DL Number" value={c.driversLicense?.number || '—'} />
          <Info label="Weapon License" value={c.weaponLicense?.status || 'none'} />
        </div>
      )}

      {tab === 'warrants' && (
        <RecordTable
          headers={['Number', 'Type', 'Reason', 'Status', 'Issued']}
          rows={profile.warrants.map((w) => [
            w.warrantNumber,
            w.type,
            w.reason,
            <span className="badge" style={{ background: w.status === 'active' ? '#3f1414' : 'var(--bg-elevated)', color: w.status === 'active' ? 'var(--danger)' : 'var(--text-muted)' }}>{w.status}</span>,
            new Date(w.issuedAt).toLocaleDateString(),
          ])}
        />
      )}

      {tab === 'citations' && (
        <RecordTable
          headers={['Number', 'Type', 'Location', 'Fine', 'Status', 'Date']}
          rows={profile.citations.map((c) => [
            c.citationNumber,
            c.type,
            c.location,
            `$${c.totalFine.toLocaleString()}`,
            c.status,
            new Date(c.createdAt).toLocaleDateString(),
          ])}
        />
      )}

      {tab === 'arrests' && (
        <RecordTable
          headers={['Number', 'Location', 'Charges', 'Fine', 'Status', 'Date']}
          rows={profile.arrests.map((a) => [
            a.arrestNumber,
            a.location,
            `${a.charges?.length ?? 0} charge${a.charges?.length !== 1 ? 's' : ''}`,
            `$${a.totalFine.toLocaleString()}`,
            a.status,
            new Date(a.arrestDate).toLocaleDateString(),
          ])}
        />
      )}

      {tab === 'vehicles' && (
        <RecordTable
          headers={['Plate', 'Vehicle', 'Color', 'Registration', 'Insurance']}
          rows={profile.vehicles.map((v) => [
            <span className="font-mono font-semibold">{v.plate}</span>,
            `${v.year} ${v.make} ${v.model}`,
            v.color,
            v.registrationStatus,
            v.insurance?.status ?? 'unknown',
          ])}
        />
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="section-title">{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}

function RecordTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  if (rows.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No records.</div>
  }
  return (
    <div className="table-wrapper">
      <table>
        <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
