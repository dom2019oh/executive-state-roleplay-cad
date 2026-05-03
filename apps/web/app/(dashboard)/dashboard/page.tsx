'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import Link from 'next/link'
import { ShieldAlert, Car, FileText, Plus, Lock } from 'lucide-react'

interface CivilianData {
  civilian: any
  vehicles: any[]
  activeWarrants: number
  citations: any[]
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<CivilianData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<CivilianData>('/civilians/me').then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading…</div>

  const c = data?.civilian

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Welcome back, {user?.discordDisplayName}</p>
      </div>

      {/* Civilian card */}
      {c && (
        <div className="card">
          <div className="section-title">Civilian Profile</div>
          <div className="flex items-start gap-4">
            {c.mugshot ? (
              <img src={c.mugshot} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
              >
                {c.firstName?.[0]}{c.lastName?.[0]}
              </div>
            )}
            <div className="flex-1 grid grid-cols-3 gap-3">
              <Field label="Full Name" value={`${c.firstName} ${c.lastName}`} />
              <Field label="Date of Birth" value={new Date(c.dateOfBirth).toLocaleDateString()} />
              <Field label="Gender" value={c.gender} />
              <Field label="Address" value={c.address || '—'} />
              <Field label="Phone" value={c.phone || '—'} />
              <Field label="Occupation" value={c.occupation || '—'} />
            </div>
          </div>

          <hr className="divider" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="section-title">Driver's License</div>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label={c.driversLicense?.status ?? 'unknown'}
                  color={c.driversLicense?.status === 'valid' ? 'var(--success)' : 'var(--danger)'}
                />
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  Class {c.driversLicense?.class} — #{c.driversLicense?.number}
                </span>
              </div>
            </div>
            <div>
              <div className="section-title">Weapon License</div>
              <StatusBadge
                label={c.weaponLicense?.status ?? 'none'}
                color={c.weaponLicense?.status === 'valid' ? 'var(--success)' : 'var(--text-muted)'}
              />
            </div>
          </div>

          {c.flags?.length > 0 && (
            <>
              <hr className="divider" />
              <div className="section-title">Flags</div>
              <div className="flex flex-wrap gap-2">
                {c.flags.map((f: string) => (
                  <span key={f} className="badge" style={{ background: '#3f1414', color: '#fca5a5' }}>
                    {f}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Active Warrants"
          value={data?.activeWarrants ?? 0}
          color={data?.activeWarrants ? 'var(--danger)' : 'var(--success)'}
          Icon={ShieldAlert}
        />
        <StatCard label="Vehicles Registered" value={data?.vehicles?.length ?? 0} color="var(--accent)" Icon={Car} />
        <StatCard label="Citations" value={data?.citations?.length ?? 0} color="var(--warning)" Icon={FileText} />
      </div>

      {/* Vehicles */}
      {(data?.vehicles?.length ?? 0) > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="section-title">Registered Vehicles</div>
            <Link href="/civilian/vehicle/add" className="flex items-center gap-1" style={{ color: 'var(--accent)', fontSize: 12 }}>
              <Plus size={12} /> Add Vehicle
            </Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Plate</th><th>Vehicle</th><th>Color</th><th>Registration</th><th>Insurance</th>
                </tr>
              </thead>
              <tbody>
                {data!.vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{v.plate}</td>
                    <td>{v.year} {v.make} {v.model}</td>
                    <td>{v.color}</td>
                    <td>
                      <StatusBadge
                        label={v.registrationStatus}
                        color={v.registrationStatus === 'valid' ? 'var(--success)' : 'var(--danger)'}
                      />
                    </td>
                    <td>
                      <StatusBadge
                        label={v.insurance?.status ?? 'none'}
                        color={v.insurance?.status === 'valid' ? 'var(--success)' : 'var(--danger)'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department join */}
      {!user?.officerId && (
        <div className="card flex flex-col gap-3">
          <div className="section-title">Department Access</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            You are currently a civilian. If you have been hired into a department and received your badge number, you can join below.
          </p>
          <div>
            <Link
              href="/department/join"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Join a Department
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

function StatCard({ label, value, color, Icon }: { label: string; value: number; color: string; Icon: React.ElementType }) {
  return (
    <div className="card flex flex-col gap-2">
      <Icon size={16} style={{ color }} />
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}
