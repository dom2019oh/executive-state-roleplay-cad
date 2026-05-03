'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { DEPT_COLORS, DEPT_LABELS, DEPARTMENTS } from '@/lib/constants'
import DeptLogo from '@/components/ui/DeptLogo'

export default function JoinDepartmentPage() {
  const router = useRouter()
  const { refetch } = useAuth()
  const [department, setDepartment] = useState('')
  const [badgeNumber, setBadgeNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!department) return setError('Select a department.')
    if (!/^\d{5}$/.test(badgeNumber)) return setError('Badge number must be exactly 5 digits.')
    setLoading(true)
    try {
      await api.post('/officers/join', { department, badgeNumber })
      await refetch()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">Join a Department</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Enter the 5-digit badge number issued to you via the Discord bot upon hire.
        </p>
      </div>

      {error && (
        <div style={{ background: '#3f1414', border: '1px solid #7f2828', color: '#fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DEPARTMENTS.map((dept) => {
          const color = DEPT_COLORS[dept]
          const selected = department === dept
          return (
            <button
              key={dept}
              type="button"
              onClick={() => setDepartment(dept)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 10,
                textAlign: 'left',
                background: selected ? `${color}18` : 'var(--bg-surface)',
                border: `1px solid ${selected ? color : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: selected ? `0 0 0 1px ${color}44` : 'none',
              }}
            >
              {/* Logo */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                background: selected ? `${color}22` : 'var(--bg-elevated)',
                border: `1px solid ${selected ? color + '44' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                padding: 4,
              }}>
                <DeptLogo dept={dept} size={40} />
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: selected ? color : 'var(--text-primary)' }}>
                  {dept}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {DEPT_LABELS[dept]}
                </div>
              </div>

              {/* Selected indicator */}
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `2px solid ${selected ? color : 'var(--border)'}`,
                background: selected ? color : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {selected && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                )}
              </div>
            </button>
          )
        })}
      </div>

      <form onSubmit={submit} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Badge Number <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            value={badgeNumber}
            onChange={(e) => setBadgeNumber(e.target.value)}
            placeholder="00000"
            maxLength={5}
            pattern="\d{5}"
            style={{ fontFamily: 'monospace', fontSize: 22, letterSpacing: '0.3em', textAlign: 'center' }}
            required
          />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Issued by the Discord bot on hire. Exactly 5 digits.</span>
        </div>

        <button
          type="submit"
          disabled={loading || !department}
          style={{
            padding: '11px 0',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            color: '#fff',
            background: loading || !department ? 'var(--text-muted)' : 'var(--success)',
            cursor: loading || !department ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Joining…' : 'Join Department'}
        </button>
      </form>
    </div>
  )
}
