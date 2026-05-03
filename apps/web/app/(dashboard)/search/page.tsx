'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import { User, Car, X, ChevronRight, AlertTriangle, MoreVertical } from 'lucide-react'

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
      setQuery('')
    } catch {}
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
      <div>
        <h1 className="page-title">Records Search</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          10-27 / 10-28 / 10-29 — Search civilians, vehicles, and warrants.
        </p>
      </div>

      {/* Search bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'person', 'vehicle'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: type === t ? 'var(--accent)' : 'var(--bg-elevated)',
                color: type === t ? '#fff' : 'var(--text-secondary)',
                border: '1px solid ' + (type === t ? 'var(--accent)' : 'var(--border)'),
                cursor: 'pointer',
              }}
            >
              {t === 'person' && <User size={11} />}
              {t === 'vehicle' && <Car size={11} />}
              {t === 'all' ? 'All' : t === 'person' ? 'Person' : 'Vehicle / Plate'}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {results.civilians.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCivilian(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <User size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>
                      {c.firstName} {c.lastName}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      DOB {new Date(c.dateOfBirth).toLocaleDateString()} · {c.gender}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c.flags?.map((f) => (
                    <span key={f} style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#3f1414', color: '#fca5a5', textTransform: 'uppercase' }}>{f}</span>
                  ))}
                  <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                </div>
              </button>
            ))}

            {results.vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => v.owner && selectCivilian(v.owner.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Car size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
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
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  background: v.registrationStatus === 'valid' ? '#16a34a22' : '#3f1414',
                  color: v.registrationStatus === 'valid' ? 'var(--success)' : 'var(--danger)',
                  textTransform: 'uppercase',
                }}>
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
  const activeWarrants = profile.warrants.filter((w) => w.status === 'active')
  const dob = c.dateOfBirth ? new Date(c.dateOfBirth) : null
  const age = dob ? (() => {
    const now = new Date()
    let a = now.getFullYear() - dob.getFullYear()
    const m = now.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--
    return a
  })() : null

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {c.firstName} {c.lastName}
              {activeWarrants.length > 0 && (
                <span style={{
                  marginLeft: 12,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  background: '#3f1414',
                  color: '#ef4444',
                  textTransform: 'uppercase',
                  verticalAlign: 'middle',
                }}>
                  {activeWarrants.length} ACTIVE WARRANT{activeWarrants.length !== 1 ? 'S' : ''}
                </span>
              )}
            </div>

            {/* Info row — 3 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '4px 28px', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>DOB:</strong>{' '}
                {dob ? dob.toLocaleDateString() : '—'}
              </span>
              {age !== null && (
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Age:</strong> {age}
                </span>
              )}
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Sex:</strong> {c.gender || '—'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Hair:</strong> {c.hairColor || '—'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Eyes:</strong> {c.eyeColor || '—'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Height:</strong> {c.height || '—'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Weight:</strong> {c.weight || '—'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Skin Tone:</strong> {c.ethnicity || '—'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Occupation:</strong> {c.occupation || '—'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <MoreVertical size={14} />
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Licenses */}
        <SectionCard
          title="Licenses"
          action={
            <button style={{
              padding: '5px 12px',
              borderRadius: 6,
              background: '#7c3aed22',
              border: '1px solid #7c3aed55',
              color: '#7c3aed',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              DMV Exam
            </button>
          }
        >
          {c.driversLicense ? (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Driver's License:</strong>{' '}
              Class {c.driversLicense.class} — #{c.driversLicense.number} —{' '}
              <span style={{ color: c.driversLicense.status === 'valid' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {c.driversLicense.status}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warning)', fontSize: 13 }}>
              <AlertTriangle size={13} />
              No licenses on file
            </div>
          )}
        </SectionCard>

        {/* Vehicles */}
        <SectionCard
          title="Vehicles"
          action={
            <button style={{
              padding: '5px 12px',
              borderRadius: 6,
              background: '#3b82f622',
              border: '1px solid #3b82f655',
              color: 'var(--accent)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Add Vehicle
            </button>
          }
        >
          {profile.vehicles.length === 0 ? (
            <em style={{ color: 'var(--text-muted)', fontSize: 13 }}>No vehicles registered yet.</em>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {profile.vehicles.map((v) => (
                <div key={v.id} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{v.plate}</span>
                  {' — '}{v.year} {v.make} {v.model} · {v.color} ·{' '}
                  <span style={{ color: v.registrationStatus === 'valid' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {v.registrationStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Weapons */}
        <SectionCard
          title="Weapons"
          action={
            <button style={{
              padding: '5px 12px',
              borderRadius: 6,
              background: '#ef444422',
              border: '1px solid #ef444455',
              color: 'var(--danger)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Add Weapon
            </button>
          }
        >
          {c.weaponLicense ? (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Weapon License:</strong>{' '}
              <span style={{ color: c.weaponLicense.status === 'valid' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {c.weaponLicense.status}
              </span>
            </div>
          ) : (
            <em style={{ color: 'var(--text-muted)', fontSize: 13 }}>No weapons registered yet.</em>
          )}
        </SectionCard>

        {/* Records */}
        <SectionCard title="Records">
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span><em>Tickets:</em> {profile.citations.length}</span>
            <span><em>Written Warnings:</em> 0</span>
            <span><em>Arrest Reports:</em> {profile.arrests.length}</span>
          </div>
        </SectionCard>

        {/* Warrants — only if exist */}
        {profile.warrants.length > 0 && (
          <SectionCard
            title="Warrants"
            action={
              activeWarrants.length > 0 ? (
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  background: '#3f1414',
                  color: '#ef4444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  ACTIVE
                </span>
              ) : undefined
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {profile.warrants.map((w) => (
                <div key={w.id} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{w.warrantNumber}</span>
                  {' — '}{w.type} · {w.reason} ·{' '}
                  <span style={{ color: w.status === 'active' ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  )
}
