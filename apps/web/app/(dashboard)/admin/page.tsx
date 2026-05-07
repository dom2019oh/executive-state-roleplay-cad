'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { ShieldAlert, Eye, EyeOff } from 'lucide-react'

const FOUNDER_ID = '924720491720237096'

interface CadUserRow {
  discordId: string
  discordUsername: string
  discordDisplayName: string
  discordAvatar: string | null
  role: string
  lastLogin: number
  createdAt: number
  banned: boolean
  guildMember: boolean
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [verified, setVerified] = useState(false)
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const [users, setUsers] = useState<CadUserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.discordId !== FOUNDER_ID)) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (verified) {
      setUsersLoading(true)
      api.get<{ users: CadUserRow[] }>('/admin/users')
        .then((d) => setUsers(d.users))
        .finally(() => setUsersLoading(false))
    }
  }, [verified])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setVerifying(true)
    try {
      await api.post('/admin/founder-verify', { password })
      setVerified(true)
    } catch (err: any) {
      setPwError(err.message ?? 'Invalid password')
    } finally {
      setVerifying(false)
    }
  }

  if (loading || !user || user.discordId !== FOUNDER_ID) return null

  if (!verified) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '100%', maxWidth: 380, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <ShieldAlert size={20} style={{ color: 'var(--gold, #c9a84c)', flexShrink: 0 }} />
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Founder Access</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
            This area is restricted to the Founder. Enter your password to continue.
          </p>
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Founder password"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${pwError ? 'var(--danger)' : 'var(--border)'}`,
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {pwError && <p style={{ fontSize: 12, color: 'var(--danger)', margin: 0 }}>{pwError}</p>}
            <button
              type="submit"
              disabled={verifying || !password}
              style={{
                padding: '10px 0',
                borderRadius: 8,
                background: 'var(--gold, #c9a84c)',
                color: '#000',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: verifying || !password ? 'not-allowed' : 'pointer',
                opacity: verifying || !password ? 0.6 : 1,
              }}
            >
              {verifying ? 'Verifying…' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldAlert size={20} style={{ color: 'var(--gold, #c9a84c)' }} />
        <h1 className="page-title" style={{ margin: 0 }}>Founder — User Registry</h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{users.length} users</span>
      </div>

      {usersLoading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['User', 'Discord ID', 'Role', 'Status', 'Last Login', 'Joined'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.discordId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {u.discordAvatar ? (
                        <img src={u.discordAvatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
                          {u.discordDisplayName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.discordDisplayName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{u.discordUsername}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>{u.discordId}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'capitalize', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: u.banned ? '#3f141422' : '#0d2e1a', color: u.banned ? 'var(--danger)' : 'var(--success)' }}>
                      {u.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 12 }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 12 }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
