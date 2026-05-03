'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { DEPT_COLORS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, UNIT_STATUS_COLORS } from '@/lib/constants'
import { RefreshCw, Plus, AlertOctagon, MapPin, Users } from 'lucide-react'

interface Call {
  id: string
  callNumber: string
  code: string
  codeLabel: string
  description: string
  location: string
  priority: 1 | 2 | 3
  status: string
  origin: string
  assignedUnits: string[]
  departmentsInvolved: string[]
  createdAt: number
}

interface Unit {
  officerId: string
  department: string
  badgeNumber: string
  callSign: string | null
  rank: string
  fullName: string
  status: string
  statusLabel: string
  currentCallId: string | null
  panicActive: boolean
  location: string | null
}

export default function DispatchPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [newCall, setNewCall] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const [pending, active, onScene, unitData] = await Promise.all([
      api.get<{ calls: Call[] }>('/calls?status=pending').catch(() => ({ calls: [] })),
      api.get<{ calls: Call[] }>('/calls?status=active').catch(() => ({ calls: [] })),
      api.get<{ calls: Call[] }>('/calls?status=on_scene').catch(() => ({ calls: [] })),
      api.get<{ units: Unit[] }>('/officers/active').catch(() => ({ units: [] })),
    ])
    setCalls([...pending.calls, ...active.calls, ...onScene.calls])
    setUnits(unitData.units)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 8000)
    return () => clearInterval(interval)
  }, [fetch])

  const panicUnits = units.filter((u) => u.panicActive)
  const deptGroups = ['LSPD', 'SAST', 'SAFD', 'SAMS', 'DISPATCH'] as const

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Dispatch Board</h1>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {units.length} unit{units.length !== 1 ? 's' : ''} online · {calls.length} active call{calls.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setNewCall(true)}
            className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold text-sm text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={13} /> New Call
          </button>
          <button
            onClick={fetch}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Panic banner */}
      {panicUnits.length > 0 && (
        <div
          className="rounded-lg px-4 py-3 flex items-center gap-3"
          style={{ background: '#3f1414', border: '1px solid var(--danger)', color: 'var(--danger)' }}
        >
          <AlertOctagon size={15} />
          <span className="font-bold">PANIC ALERT</span>
          {panicUnits.map((u) => (
            <span key={u.officerId} className="badge" style={{ background: 'var(--danger)', color: '#fff' }}>
              {u.department} #{u.badgeNumber} — {u.fullName}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Calls column */}
        <div className="flex flex-col gap-3">
          <div className="section-title">Active Calls</div>

          {loading && <div style={{ color: 'var(--text-muted)' }}>Loading…</div>}
          {!loading && calls.length === 0 && (
            <div className="card text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No active calls.
            </div>
          )}

          {calls.map((call) => {
            const pColor = PRIORITY_COLORS[call.priority]
            const sColor = STATUS_COLORS[call.status] ?? 'var(--text-muted)'
            return (
              <button
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className="card text-left w-full transition-all"
                style={{
                  borderLeft: `3px solid ${pColor}`,
                  background: selectedCall?.id === call.id ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="badge" style={{ background: pColor + '22', color: pColor }}>
                      Code {call.priority}
                    </span>
                    <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                      {call.code}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{call.codeLabel}</span>
                  </div>
                  <span className="badge" style={{ background: sColor + '22', color: sColor }}>
                    {call.status}
                  </span>
                </div>

                <div style={{ color: 'var(--text-primary)', fontSize: 13, marginBottom: 6 }}>{call.description}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    <MapPin size={11} /> {call.location}
                  </div>
                  <div className="flex items-center gap-2">
                    {call.assignedUnits.length > 0 && (
                      <div className="flex items-center gap-1 badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        <Users size={10} />
                        {call.assignedUnits.length}
                      </div>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{call.callNumber}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Units panel */}
        <div className="flex flex-col gap-3">
          <div className="section-title">Active Units</div>
          {deptGroups.map((dept) => {
            const deptUnits = units.filter((u) => u.department === dept)
            if (deptUnits.length === 0) return null
            const color = DEPT_COLORS[dept]
            return (
              <div key={dept}>
                <div className="flex items-center gap-2 mb-2" style={{ borderLeft: `2px solid ${color}`, paddingLeft: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: '0.06em' }}>{dept}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{deptUnits.length}</span>
                </div>
                {deptUnits.map((unit) => {
                  const uColor = UNIT_STATUS_COLORS[unit.status] ?? 'var(--text-muted)'
                  return (
                    <div
                      key={unit.officerId}
                      className="card mb-2 flex items-center justify-between"
                      style={{ padding: '8px 12px', borderColor: unit.panicActive ? 'var(--danger)' : 'var(--border-subtle)' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: uColor }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                            #{unit.badgeNumber}{unit.callSign ? ` · ${unit.callSign}` : ''}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{unit.fullName}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: uColor }}>{unit.status}</div>
                        {unit.location && (
                          <div className="flex items-center gap-1 justify-end" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            <MapPin size={9} /> {unit.location}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}

          {units.length === 0 && !loading && (
            <div className="card text-center py-4" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              No units online.
            </div>
          )}
        </div>
      </div>

      {newCall && <NewCallModal onClose={() => setNewCall(false)} onCreated={() => { setNewCall(false); fetch() }} />}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          units={units}
          onClose={() => setSelectedCall(null)}
          onUpdate={() => { setSelectedCall(null); fetch() }}
        />
      )}
    </div>
  )
}

function NewCallModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ code: '', codeLabel: '', description: '', location: '', priority: '2' })
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/calls', { ...form, priority: Number(form.priority) })
      onCreated()
    } catch (e: any) { alert(e.message) }
    setLoading(false)
  }

  return (
    <Modal title="Create New Call" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="10-Code">
            <input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} placeholder="10-11" required />
          </ModalField>
          <ModalField label="Code Label">
            <input value={form.codeLabel} onChange={(e) => setForm(f => ({ ...f, codeLabel: e.target.value }))} placeholder="Traffic Stop" />
          </ModalField>
        </div>
        <ModalField label="Description">
          <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Details…" style={{ resize: 'none' }} />
        </ModalField>
        <ModalField label="Location">
          <input value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Vinewood Blvd & Alta" required />
        </ModalField>
        <ModalField label="Priority">
          <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option value="1">Code 1 — Emergency</option>
            <option value="2">Code 2 — Urgent</option>
            <option value="3">Code 3 — Routine</option>
          </select>
        </ModalField>
        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-white mt-2" style={{ background: 'var(--accent)' }}>
          <Plus size={13} /> {loading ? 'Creating…' : 'Create Call'}
        </button>
      </form>
    </Modal>
  )
}

function CallDetailModal({ call, units, onClose, onUpdate }: { call: Call; units: Unit[]; onClose: () => void; onUpdate: () => void }) {
  const [selected, setSelected] = useState<string[]>(call.assignedUnits)
  const [loading, setLoading] = useState(false)

  async function assign() {
    setLoading(true)
    try {
      await api.patch(`/calls/${call.id}/assign`, { officerIds: selected })
      onUpdate()
    } catch (e: any) { alert(e.message) }
    setLoading(false)
  }

  async function close() {
    setLoading(true)
    try {
      await api.patch(`/calls/${call.id}/status`, { status: 'closed' })
      onUpdate()
    } catch (e: any) { alert(e.message) }
    setLoading(false)
  }

  const pColor = PRIORITY_COLORS[call.priority]

  return (
    <Modal title={`${call.callNumber} — ${call.code} ${call.codeLabel}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="section-title flex items-center gap-1"><MapPin size={10} /> Location</div>
            <div style={{ color: 'var(--text-primary)', fontSize: 13 }}>{call.location}</div>
          </div>
          <div>
            <div className="section-title">Priority</div>
            <span className="badge" style={{ background: pColor + '22', color: pColor }}>{PRIORITY_LABELS[call.priority]}</span>
          </div>
        </div>
        {call.description && (
          <div>
            <div className="section-title">Description</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{call.description}</div>
          </div>
        )}

        <div>
          <div className="section-title flex items-center gap-1 mb-2"><Users size={10} /> Assign Units</div>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {units.map((u) => (
              <label
                key={u.officerId}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
                style={{ background: selected.includes(u.officerId) ? 'var(--bg-hover)' : 'transparent' }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(u.officerId)}
                  onChange={(e) => setSelected(s => e.target.checked ? [...s, u.officerId] : s.filter(x => x !== u.officerId))}
                  style={{ width: 14, height: 14 }}
                />
                <span className="badge" style={{ background: DEPT_COLORS[u.department] + '22', color: DEPT_COLORS[u.department] }}>
                  {u.department}
                </span>
                <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>#{u.badgeNumber} — {u.fullName}</span>
                <span style={{ color: UNIT_STATUS_COLORS[u.status] ?? 'var(--text-muted)', fontSize: 11, marginLeft: 'auto' }}>{u.status}</span>
              </label>
            ))}
            {units.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No units online.</div>}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={assign} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-white text-sm" style={{ background: 'var(--accent)' }}>
            <Users size={13} /> {loading ? '…' : 'Assign Units'}
          </button>
          <button onClick={close} disabled={loading} className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold text-sm" style={{ background: '#3f1414', color: 'var(--danger)', border: '1px solid #7f282844' }}>
            Close Call
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="card w-full max-w-lg flex flex-col gap-4" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between">
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'transparent', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="section-title">{label}</label>
      {children}
    </div>
  )
}
