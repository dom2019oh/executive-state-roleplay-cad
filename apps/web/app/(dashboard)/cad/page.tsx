'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { DEPT_COLORS, TEN_CODES, UNIT_STATUS_COLORS } from '@/lib/constants'

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

export default function CadPage() {
  const { user } = useAuth()
  const [officer, setOfficer] = useState<OfficerState | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [location, setLocation] = useState('')
  const [showStatusPicker, setShowStatusPicker] = useState(false)

  const fetchOfficer = useCallback(async () => {
    try {
      const data = await api.get<{ officer: OfficerState }>(`/officers/me`)
      setOfficer(data.officer)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchOfficer() }, [fetchOfficer])

  async function clockIn() {
    setStatusLoading(true)
    try {
      await api.post('/officers/clock-in', {})
      await fetchOfficer()
    } catch (e: any) { alert(e.message) }
    setStatusLoading(false)
  }

  async function clockOut() {
    if (!confirm('End your tour of duty?')) return
    setStatusLoading(true)
    try {
      await api.post('/officers/clock-out', {})
      await fetchOfficer()
    } catch (e: any) { alert(e.message) }
    setStatusLoading(false)
  }

  async function setStatus(code: string, label: string) {
    setShowStatusPicker(false)
    setStatusLoading(true)
    try {
      await api.patch('/officers/status', { status: code, statusLabel: label, location })
      setOfficer((o) => o ? { ...o, status: code, statusLabel: label } : o)
    } catch (e: any) { alert(e.message) }
    setStatusLoading(false)
  }

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading…</div>

  if (!user?.officerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <div style={{ color: 'var(--text-muted)', fontSize: 32 }}>🚔</div>
        <p style={{ color: 'var(--text-secondary)' }}>You need to join a department first.</p>
      </div>
    )
  }

  const deptColor = DEPT_COLORS[officer?.department ?? ''] ?? 'var(--accent)'
  const statusColor = UNIT_STATUS_COLORS[officer?.status ?? ''] ?? 'var(--text-muted)'
  const isPanic = officer?.status === '10-99' || officer?.status === '10-100'

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="page-title">CAD Interface</h1>
        <div className="flex items-center gap-2">
          {officer?.clockedIn ? (
            <button onClick={clockOut} disabled={statusLoading} className="btn-ghost text-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
              {statusLoading ? '…' : '10-42 Clock Out'}
            </button>
          ) : (
            <button onClick={clockIn} disabled={statusLoading} className="py-2 px-4 rounded-lg font-semibold text-white text-sm" style={{ background: 'var(--success)' }}>
              {statusLoading ? '…' : '10-41 Clock In'}
            </button>
          )}
        </div>
      </div>

      {/* Unit card */}
      <div className="card" style={{ borderColor: officer?.clockedIn ? deptColor + '44' : 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ background: deptColor + '22', color: deptColor }}
            >
              {officer?.department}
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Badge #{officer?.badgeNumber}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {officer?.rank}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: officer?.clockedIn ? statusColor : 'var(--text-muted)',
                boxShadow: officer?.clockedIn && !isPanic ? `0 0 8px ${statusColor}` : isPanic ? `0 0 16px var(--danger)` : 'none',
              }}
            />
            <div style={{ color: officer?.clockedIn ? statusColor : 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
              {officer?.clockedIn ? `${officer.status} — ${officer.statusLabel}` : 'Off Duty'}
            </div>
          </div>
        </div>

        {officer?.clockedIn && (
          <>
            <hr className="divider" />

            {/* Location */}
            <div className="flex flex-col gap-1 mb-4">
              <label className="section-title">Current Location (10-20)</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Vinewood Blvd & Alta St"
              />
            </div>

            {/* Status codes */}
            <div className="section-title">Status Update</div>
            <div className="grid grid-cols-4 gap-2">
              {TEN_CODES.map((tc) => {
                const color = UNIT_STATUS_COLORS[tc.code] ?? 'var(--text-muted)'
                const isActive = officer.status === tc.code
                const isEmergency = tc.code === '10-99' || tc.code === '10-100'
                return (
                  <button
                    key={tc.code}
                    onClick={() => setStatus(tc.code, tc.label)}
                    disabled={statusLoading}
                    className="flex flex-col items-start px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      background: isActive ? `${color}22` : isEmergency ? '#3f141422' : 'var(--bg-elevated)',
                      border: `1px solid ${isActive ? color : isEmergency ? 'var(--danger)44' : 'var(--border-subtle)'}`,
                      color: isActive ? color : isEmergency ? 'var(--danger)' : 'var(--text-secondary)',
                    }}
                  >
                    <div className="font-mono font-semibold text-xs">{tc.code}</div>
                    <div style={{ fontSize: 11, lineHeight: 1.3 }}>{tc.label}</div>
                  </button>
                )
              })}
            </div>

            {isPanic && (
              <div
                className="mt-4 rounded-lg px-4 py-3 text-sm font-semibold text-center"
                style={{ background: '#3f1414', border: '1px solid var(--danger)', color: 'var(--danger)' }}
              >
                ⚠ PANIC ACTIVE — {officer.status} — OFFICER IN DISTRESS
              </div>
            )}
          </>
        )}
      </div>

      {!officer?.clockedIn && (
        <div
          className="card text-center py-10"
          style={{ color: 'var(--text-muted)' }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
          <p>Clock in with <strong>10-41</strong> to access CAD functions.</p>
        </div>
      )}
    </div>
  )
}
