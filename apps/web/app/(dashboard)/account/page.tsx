'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { User, Shield, BadgeCheck, Plane } from 'lucide-react'

const BADGE_FLAGS: Record<number, string> = {
  1: 'Discord Staff', 64: 'HypeSquad Events', 128: 'Bug Hunter',
  512: 'HypeSquad Bravery', 1024: 'HypeSquad Brilliance', 2048: 'HypeSquad Balance',
  16384: 'Early Supporter', 131072: 'Bug Hunter Gold', 4194304: 'Active Developer',
}

const NITRO_LABELS: Record<number, string> = { 0: 'None', 1: 'Nitro Classic', 2: 'Nitro', 3: 'Nitro Basic' }

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={15} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>{title}</span>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
}

const readonlyStyle: React.CSSProperties = {
  ...inputStyle, color: 'var(--text-secondary)', cursor: 'default',
}

export default function AccountPage() {
  const { user, refetch } = useAuth()
  const [civilian, setCivilian] = useState<any>(null)
  const [officer, setOfficer] = useState<any>(null)
  const [civForm, setCivForm] = useState<any>({})
  const [offForm, setOffForm] = useState<any>({})
  const [civSaving, setCivSaving] = useState(false)
  const [offSaving, setOffSaving] = useState(false)
  const [civMsg, setCivMsg] = useState('')
  const [offMsg, setOffMsg] = useState('')

  useEffect(() => {
    api.get<any>('/civilians/me').then((d) => {
      setCivilian(d.civilian)
      if (d.civilian) setCivForm({
        address: d.civilian.address || '',
        phone: d.civilian.phone || '',
        occupation: d.civilian.occupation || '',
        height: d.civilian.height || '',
        weight: d.civilian.weight || '',
        hairColor: d.civilian.hairColor || '',
        eyeColor: d.civilian.eyeColor || '',
      })
    }).catch(() => {})

    if (['officer', 'dispatcher', 'admin'].includes(user?.role ?? '')) {
      api.get<any>('/officers/me').then((d) => {
        setOfficer(d.officer)
        if (d.officer) setOffForm({
          callSign: d.officer.callSign || '',
          loa: !!d.officer.loa,
          loaReason: d.officer.loaReason || '',
        })
      }).catch(() => {})
    }
  }, [user])

  async function saveCivilian() {
    if (!civilian) return
    setCivSaving(true); setCivMsg('')
    try {
      await api.patch(`/civilians/${civilian.id ?? user?.civilianId}`, civForm)
      setCivMsg('Saved.')
    } catch (e: any) { setCivMsg(e.message) }
    finally { setCivSaving(false) }
  }

  async function saveOfficer() {
    setOffSaving(true); setOffMsg('')
    try {
      await api.patch('/officers/me', offForm)
      setOffMsg('Saved.')
    } catch (e: any) { setOffMsg(e.message) }
    finally { setOffSaving(false) }
  }

  const badges = Object.entries(BADGE_FLAGS)
    .filter(([bit]) => (user?.discordBadges ?? 0) & Number(bit))
    .map(([, name]) => name)

  const isOfficer = ['officer', 'dispatcher', 'admin'].includes(user?.role ?? '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
      <div>
        <h1 className="page-title">My Account</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage your CAD profile and officer settings.</p>
      </div>

      {/* Discord Profile */}
      <Section title="Discord Profile" icon={User}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {user?.discordAvatar
            ? <img src={user.discordAvatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--border)' }} />
            : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--text-muted)' }}>{user?.discordDisplayName?.[0]}</div>
          }
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{user?.discordDisplayName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{user?.discordUsername}</div>
            {user?.guildNickname && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>"{user.guildNickname}" on server</div>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Email"><input style={readonlyStyle} value={user?.discordEmail ?? '—'} readOnly /></Field>
          <Field label="Discord ID"><input style={readonlyStyle} value={user?.discordId ?? ''} readOnly /></Field>
          <Field label="Nitro"><input style={readonlyStyle} value={NITRO_LABELS[user?.discordNitro ?? 0]} readOnly /></Field>
          <Field label="CAD Role"><input style={readonlyStyle} value={user?.role ?? ''} readOnly style={{ ...readonlyStyle, textTransform: 'capitalize' }} /></Field>
          {badges.length > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Badges">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {badges.map((b) => (
                    <span key={b} style={{ padding: '2px 10px', borderRadius: 6, background: 'var(--bg-elevated)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{b}</span>
                  ))}
                </div>
              </Field>
            </div>
          )}
        </div>
      </Section>

      {/* Civilian Profile */}
      {civilian && (
        <Section title="Civilian Profile" icon={BadgeCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label="Full Name"><input style={readonlyStyle} value={`${civilian.firstName} ${civilian.lastName}`} readOnly /></Field>
            <Field label="Date of Birth"><input style={readonlyStyle} value={civilian.dateOfBirth ? new Date(civilian.dateOfBirth).toLocaleDateString() : '—'} readOnly /></Field>
            <Field label="Address">
              <input style={inputStyle} value={civForm.address ?? ''} onChange={(e) => setCivForm((p: any) => ({ ...p, address: e.target.value }))} placeholder="In-game address" />
            </Field>
            <Field label="Phone">
              <input style={inputStyle} value={civForm.phone ?? ''} onChange={(e) => setCivForm((p: any) => ({ ...p, phone: e.target.value }))} placeholder="In-game number" />
            </Field>
            <Field label="Occupation">
              <input style={inputStyle} value={civForm.occupation ?? ''} onChange={(e) => setCivForm((p: any) => ({ ...p, occupation: e.target.value }))} placeholder="Job title" />
            </Field>
            <Field label="Height">
              <input style={inputStyle} value={civForm.height ?? ''} onChange={(e) => setCivForm((p: any) => ({ ...p, height: e.target.value }))} placeholder={`e.g. 5'11"`} />
            </Field>
            <Field label="Weight">
              <input style={inputStyle} value={civForm.weight ?? ''} onChange={(e) => setCivForm((p: any) => ({ ...p, weight: e.target.value }))} placeholder="e.g. 180 lbs" />
            </Field>
            <Field label="Hair Color">
              <input style={inputStyle} value={civForm.hairColor ?? ''} onChange={(e) => setCivForm((p: any) => ({ ...p, hairColor: e.target.value }))} placeholder="e.g. Black" />
            </Field>
            <Field label="Eye Color">
              <input style={inputStyle} value={civForm.eyeColor ?? ''} onChange={(e) => setCivForm((p: any) => ({ ...p, eyeColor: e.target.value }))} placeholder="e.g. Brown" />
            </Field>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {civMsg && <span style={{ fontSize: 12, color: civMsg === 'Saved.' ? 'var(--success)' : 'var(--danger)' }}>{civMsg}</span>}
            <button onClick={saveCivilian} disabled={civSaving} style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: civSaving ? 'not-allowed' : 'pointer', opacity: civSaving ? 0.6 : 1 }}>
              {civSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Section>
      )}

      {/* Officer Settings */}
      {isOfficer && officer && (
        <Section title="Officer Settings" icon={Shield}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label="Department"><input style={readonlyStyle} value={officer.department} readOnly /></Field>
            <Field label="Badge Number"><input style={readonlyStyle} value={officer.badgeNumber} readOnly /></Field>
            <Field label="Rank"><input style={readonlyStyle} value={officer.rank} readOnly /></Field>
            <Field label="Call Sign">
              <input style={inputStyle} value={offForm.callSign ?? ''} onChange={(e) => setOffForm((p: any) => ({ ...p, callSign: e.target.value }))} placeholder="e.g. 1-ADAM-12" />
            </Field>
          </div>

          {/* LOA */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: offForm.loa ? 10 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plane size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Leave of Absence (LOA)</span>
              </div>
              <button
                onClick={() => setOffForm((p: any) => ({ ...p, loa: !p.loa }))}
                style={{
                  padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  background: offForm.loa ? 'var(--warning, #d97706)' : 'var(--bg-base)',
                  color: offForm.loa ? '#fff' : 'var(--text-muted)',
                }}
              >
                {offForm.loa ? 'On LOA' : 'Off LOA'}
              </button>
            </div>
            {offForm.loa && (
              <input
                style={{ ...inputStyle, marginTop: 8 }}
                value={offForm.loaReason ?? ''}
                onChange={(e) => setOffForm((p: any) => ({ ...p, loaReason: e.target.value }))}
                placeholder="Reason for LOA (optional)"
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {offMsg && <span style={{ fontSize: 12, color: offMsg === 'Saved.' ? 'var(--success)' : 'var(--danger)' }}>{offMsg}</span>}
            <button onClick={saveOfficer} disabled={offSaving} style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: offSaving ? 'not-allowed' : 'pointer', opacity: offSaving ? 0.6 : 1 }}>
              {offSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Section>
      )}
    </div>
  )
}
