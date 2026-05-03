'use client'



import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function MazeBankLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Maze Bank top bar */}
      <header style={{
        height: 56,
        background: '#111',
        borderBottom: '2px solid #c0392b',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
      }}>
        {/* Logo */}
        {/* Real Maze Bank logo */}
        <img
          src="/logos/maze-bank-dark.png"
          alt="Maze Bank"
          style={{ height: 40, objectFit: 'contain', marginRight: 8 }}
        />

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: '#333' }} />

        {/* Section title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>My Accounts</span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Welcome + Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#666' }}>Welcome</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user.discordDisplayName}</div>
          </div>
          <Link
            href="/dashboard"
            style={{
              padding: '7px 18px',
              background: '#c0392b',
              color: '#fff',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#a93226')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#c0392b')}
          >
            Exit
          </Link>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {children}
      </div>
    </div>
  )
}
