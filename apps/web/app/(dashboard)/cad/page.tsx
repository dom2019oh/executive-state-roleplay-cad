'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { DEPT_COLORS, UNIT_STATUS_COLORS } from '@/lib/constants'
import { Lock, AlertOctagon } from 'lucide-react'

interface OfficerState {
  id: string
  clockedIn: boolean
  status: string
  statusLabel: string
  department: string
  badgeNumber: string
  rank: string
  currentCallId: string | null
}

interface ActiveOfficer {
  id: string
  discordDisplayName: string
  department: string
  rank: string
  badgeNumber: string
  status: string
  statusLabel: string
  patrolVehicle: string | null
  activeCallId: string | null
}

const ACTION_BUTTONS = [
  ['Name Search', 'Plate Search', 'Weapon Search', 'Vehicle Search'],
  ['Create 911 Call', 'Create Written Warning', 'Create Citation', 'Create Arrest Report'],
  ['Create Warrant', 'Create Bolo', 'Create Incident', 'Notepad'],
  ['Department Info', 'Request Backup (10-32)', 'Request EMS (10-52)', 'Request Fire (10-53)'],
]

const STATUS_PILLS = [
  { code: '10-41', label: 'Start Shift', activeColor: '#22c55e', isClockIn: true },
  { code: '10-42', label: 'End Shift', activeColor: '#ef4444', isClockOut: true },
  { code: '10-8', label: 'Available', activeColor: '#22c55e' },
  { code: '10-7', label: 'Unavailable', activeColor: '#6b7280' },
  { code: '10-5', label: 'Meal Break', activeColor: '#f59e0b' },
  { code: '10-6', label: 'Busy', activeColor: '#f59e0b' },
  { code: '10-23', label: 'Arrived On Scene', activeColor: '#3b82f6' },
  { code: '10-97', label: 'En Route', activeColor: '#3b82f6' },
  { code: '10-99', label: 'Officer In Distress', activeColor: '#ef4444', isPanic: true },
]

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function formatClock(date: Date): string {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${month} ${day}, ${year} at ${h}:${m}:${s}`
}

export default function CadPage() {
  const { user } = useAuth()
  const now = useClock()
  const [officer, setOfficer] = useState<OfficerState | null>(null)
  const [activeOfficers, setActiveOfficers] = useState<ActiveOfficer[]>([])
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)

  const fetchOfficer = useCallback(async () => {
    try {
      const data = await api.get<{ officer: OfficerState }>('/officers/me')
      setOfficer(data.officer)
    } catch {}
    setLoading(false)
  }, [])

  const fetchActive = useCallback(async () => {
    try {
      const data = await api.get<{ officers: ActiveOfficer[] }>('/officers/active')
      setActiveOfficers(data.officers)
    } catch {}
  }, [])

  useEffect(() => {
    fetchOfficer()
    fetchActive()
    const id = setInterval(fetchActive, 10000)
    return () => clearInterval(id)
  }, [fetchOfficer, fetchActive])

  async function clockIn() {
    setStatusLoading(true)
    try {
      await api.post('/officers/clock-in', {})
      await fetchOfficer()
      await fetchActive()
    } catch (e: any) { alert(e.message) }
    setStatusLoading(false)
  }

  async function clockOut() {
    if (!confirm('End your tour of duty?')) return
    setStatusLoading(true)
    try {
      await api.post('/officers/clock-out', {})
      await fetchOfficer()
      await fetchActive()
    } catch (e: any) { alert(e.message) }
    setStatusLoading(false)
  }

  async function setStatus(code: string, label: string) {
    setStatusLoading(true)
    try {
      await api.patch('/officers/status', { status: code, statusLabel: label })
      setOfficer((o) => o ? { ...o, status: code, statusLabel: label } : o)
      await fetchActive()
    } catch (e: any) { alert(e.message) }
    setStatusLoading(false)
  }

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading…</div>

  if (!user?.officerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <Lock size={32} style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>You need to join a department first.</p>
      </div>
    )
  }

  const isClockedIn = officer?.clockedIn ?? false
  const currentStatus = officer?.status ?? ''
  const isPanic = currentStatus === '10-99' || currentStatus === '10-100'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100 }}>

      {/* Utility Panel */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
          Utility Panel — <span style={{ color: 'var(--text-secondary)' }}>AOP: Los Santos</span>
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {formatClock(now)}
        </span>
      </div>

      {/* Action Button Grid */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {ACTION_BUTTONS.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {row.map((label) => (
              <button
                key={label}
                disabled={!isClockedIn}
                title={!isClockedIn ? 'Clock in with 10-41 to unlock' : undefined}
                style={{
                  height: 44,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: isClockedIn ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: isClockedIn ? 'pointer' : 'not-allowed',
                  opacity: isClockedIn ? 1 : 0.5,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '0 8px',
                }}
                onMouseEnter={(e) => {
                  if (isClockedIn) {
                    e.currentTarget.style.background = 'var(--bg-input)'
                    e.currentTarget.style.borderColor = 'var(--accent)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Status Pills Row */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 12,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {STATUS_PILLS.map((pill) => {
          const isActive = currentStatus === pill.code
          const isClockInPill = pill.isClockIn
          const isClockOutPill = pill.isClockOut
          const clickable = isClockInPill ? !isClockedIn : (isClockOutPill ? isClockedIn : isClockedIn)

          async function handleClick() {
            if (statusLoading) return
            if (isClockInPill) { await clockIn(); return }
            if (isClockOutPill) { await clockOut(); return }
            await setStatus(pill.code, pill.label)
          }

          return (
            <button
              key={pill.code}
              onClick={handleClick}
              disabled={statusLoading || !clickable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${isActive ? pill.activeColor : 'var(--border)'}`,
                background: isActive ? `${pill.activeColor}22` : 'var(--bg-elevated)',
                color: isActive ? pill.activeColor : (!clickable ? 'var(--text-muted)' : 'var(--text-secondary)'),
                cursor: clickable ? 'pointer' : 'not-allowed',
                opacity: clickable ? 1 : 0.5,
                transition: 'all 0.15s',
                boxShadow: isActive && pill.isPanic ? `0 0 12px ${pill.activeColor}66` : 'none',
                animation: isActive && pill.isPanic ? 'pulse-danger 1.5s infinite' : 'none',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{pill.code}</span>
              <span>•</span>
              <span>{pill.label}</span>
            </button>
          )
        })}

        {isPanic && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 14px',
              borderRadius: 20,
              background: '#3f1414',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              fontSize: 12,
              fontWeight: 700,
              marginLeft: 'auto',
            }}
          >
            <AlertOctagon size={13} />
            PANIC ACTIVE
          </div>
        )}
      </div>

      {/* Active Officers Table */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="section-title" style={{ marginBottom: 0 }}>Active Officers</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Refreshes every 10s</span>
        </div>
        {activeOfficers.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No officers currently clocked in.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Officer</th>
                <th>Department</th>
                <th>Rank</th>
                <th>Status</th>
                <th>Patrol Vehicle</th>
                <th>Active Call</th>
              </tr>
            </thead>
            <tbody>
              {activeOfficers.map((o) => {
                const deptColor = DEPT_COLORS[o.department] ?? 'var(--accent)'
                const statusColor = UNIT_STATUS_COLORS[o.status] ?? 'var(--text-muted)'
                return (
                  <tr key={o.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 7px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            background: deptColor + '22',
                            color: deptColor,
                            border: `1px solid ${deptColor}44`,
                          }}
                        >
                          #{o.badgeNumber}
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{o.discordDisplayName}</span>
                      </div>
                    </td>
                    <td>{o.department}</td>
                    <td>{o.rank}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: statusColor,
                            boxShadow: `0 0 6px ${statusColor}`,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ color: statusColor, fontSize: 12, fontWeight: 600 }}>
                          {o.status} — {o.statusLabel}
                        </span>
                      </div>
                    </td>
                    <td>{o.patrolVehicle || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      {o.activeCallId ? (
                        <span style={{ color: 'var(--accent)', fontSize: 12, fontFamily: 'monospace' }}>{o.activeCallId}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
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
