'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { DEPT_COLORS, DEPT_LABELS, DEPARTMENTS } from '@/lib/constants'

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
    <div className="max-w-xl flex flex-col gap-6">
      <div>
        <h1 className="page-title">Join a Department</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Enter the 5-digit badge number issued to you via the Discord bot upon hire.
        </p>
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: '#3f1414', border: '1px solid #7f2828', color: '#fca5a5' }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {DEPARTMENTS.map((dept) => {
          const color = DEPT_COLORS[dept]
          const selected = department === dept
          return (
            <button
              key={dept}
              type="button"
              onClick={() => setDepartment(dept)}
              className="flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all"
              style={{
                background: selected ? `${color}22` : 'var(--bg-surface)',
                border: `1px solid ${selected ? color : 'var(--border-subtle)'}`,
                color: selected ? color : 'var(--text-secondary)',
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: color, boxShadow: selected ? `0 0 8px ${color}` : 'none' }}
              />
              <div>
                <div className="font-semibold text-sm">{dept}</div>
                <div className="text-xs opacity-70">{DEPT_LABELS[dept]}</div>
              </div>
            </button>
          )
        })}
      </div>

      <form onSubmit={submit} className="card flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Badge Number <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            value={badgeNumber}
            onChange={(e) => setBadgeNumber(e.target.value)}
            placeholder="00000"
            maxLength={5}
            pattern="\d{5}"
            className="font-mono text-lg tracking-widest"
            required
          />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Issued by the Discord bot on hire. 5 digits.</span>
        </div>

        <button
          type="submit"
          disabled={loading || !department}
          className="py-3 rounded-lg font-semibold text-white"
          style={{ background: loading || !department ? 'var(--text-muted)' : 'var(--accent)' }}
        >
          {loading ? 'Joining…' : 'Join Department'}
        </button>
      </form>
    </div>
  )
}
