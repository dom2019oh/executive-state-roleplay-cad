'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import Link from 'next/link'
import { ShieldAlert, Car, FileText, Plus, User } from 'lucide-react'
import { DEPT_COLORS, DEPT_LABELS } from '@/lib/constants'
import DeptLogo from '@/components/ui/DeptLogo'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
      {/* Header */}
      <div>
        <h1 className="page-title">Civilian Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Welcome back, {user?.discordDisplayName}
        </p>
      </div>

      {/* Your Civilians */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Your Civilians</h2>
          {!c && (
            <Link
              href="/civilian/create"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                background: 'var(--success)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Plus size={14} />
              Add Civilian
            </Link>
          )}
        </div>

        {c ? (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 16,
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--text-muted)',
                flexShrink: 0,
              }}
            >
              {c.firstName?.[0]}{c.lastName?.[0]}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {c.firstName} {c.middleInitial ? `${c.middleInitial}. ` : ''}{c.lastName}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>DOB:</strong>{' '}
                  {c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString() : '—'}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Gender:</strong> {c.gender || '—'}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Occupation:</strong> {c.occupation || '—'}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Phone:</strong> {c.phone || '—'}
                </span>
              </div>

              {/* License badges */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <StatusBadge
                  label={`DL: ${c.driversLicense?.status ?? 'unknown'}`}
                  color={c.driversLicense?.status === 'valid' ? 'var(--success)' : 'var(--danger)'}
                />
                <StatusBadge
                  label={`Weapon: ${c.weaponLicense?.status ?? 'none'}`}
                  color={c.weaponLicense?.status === 'valid' ? 'var(--success)' : 'var(--text-muted)'}
                />
                {(data?.activeWarrants ?? 0) > 0 && (
                  <StatusBadge
                    label={`${data!.activeWarrants} ACTIVE WARRANT${data!.activeWarrants !== 1 ? 'S' : ''}`}
                    color="var(--danger)"
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border)',
              borderRadius: 10,
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <User size={40} style={{ color: 'var(--text-muted)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                No civilian profile yet
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Create your civilian profile to access CAD features.
              </div>
            </div>
            <Link
              href="/civilian/create"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 8,
                background: 'var(--success)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Plus size={15} />
              Create Your Civilian Profile
            </Link>
          </div>
        )}
      </div>

      {/* Stats row */}
      {c && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <StatCard
            label="Active Warrants"
            value={data?.activeWarrants ?? 0}
            color={data?.activeWarrants ? 'var(--danger)' : 'var(--success)'}
            Icon={ShieldAlert}
          />
          <StatCard label="Vehicles" value={data?.vehicles?.length ?? 0} color="var(--accent)" Icon={Car} />
          <StatCard label="Citations" value={data?.citations?.length ?? 0} color="var(--warning)" Icon={FileText} />
        </div>
      )}

      {/* Vehicles */}
      {(data?.vehicles?.length ?? 0) > 0 && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Registered Vehicles</span>
            <Link
              href="/civilian/vehicle/add"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <Plus size={12} /> Add Vehicle
            </Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Plate</th><th>Vehicle</th><th>Color</th><th>Registration</th><th>Insurance</th>
              </tr>
            </thead>
            <tbody>
              {data!.vehicles.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{v.plate}</td>
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
      )}

      {/* Officer status card */}
      {user?.officerId && (
        <OfficerCard />
      )}

      {/* Join department */}
      {!user?.officerId && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Department Access</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
            You are currently a civilian. If you have been hired into a department and received your badge number, you can join below.
          </p>
          <div>
            <Link
              href="/department/join"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Join a Department
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function OfficerCard() {
  const [officer, setOfficer] = useState<any>(null)
  useEffect(() => {
    api.get<{ officer: any }>('/officers/me').then((d) => setOfficer(d.officer)).catch(() => {})
  }, [])
  if (!officer) return null
  const deptColor = DEPT_COLORS[officer.department] ?? 'var(--accent)'
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${officer.clockedIn ? deptColor + '55' : 'var(--border)'}`,
        borderRadius: 10,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 8,
          background: deptColor + '18',
          border: `1px solid ${deptColor}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: 4,
        }}
      >
        <DeptLogo dept={officer.department} size={40} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
          Badge #{officer.badgeNumber}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {officer.rank} · {DEPT_LABELS[officer.department] ?? officer.department}
        </div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: officer.clockedIn ? 'var(--success)' : 'var(--text-muted)',
            boxShadow: officer.clockedIn ? '0 0 6px var(--success)' : 'none',
          }}
        />
        <span style={{ fontSize: 12, color: officer.clockedIn ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
          {officer.clockedIn ? `On Duty — ${officer.status}` : 'Off Duty'}
        </span>
      </div>
    </div>
  )
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {label}
    </span>
  )
}

function StatCard({ label, value, color, Icon }: { label: string; value: number; color: string; Icon: React.ElementType }) {
  return (
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
      <Icon size={16} style={{ color }} />
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}
