'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { logout } from '@/lib/api'
import { DEPT_COLORS, DEPT_SHORT } from '@/lib/constants'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { href: '/dispatch', label: 'Dispatch', icon: '📡', roles: ['dispatcher', 'admin'] },
  { href: '/cad', label: 'CAD', icon: '🚔', roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/search', label: 'Search', icon: '🔍', roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/incidents', label: 'Incidents', icon: '📋', roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/arrests', label: 'Arrests', icon: '⛓', roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/citations', label: 'Citations', icon: '📄', roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/warrants', label: 'Warrants', icon: '⚖', roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/bolos', label: 'BOLOs', icon: '📢', roles: ['officer', 'dispatcher', 'admin'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const visibleNav = NAV.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(user?.role ?? '')
  })

  return (
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{
        width: 220,
        minWidth: 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          ES
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Executive State
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            CAD System
          </div>
        </div>
      </div>

      {/* Officer info */}
      {user?.officerId && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            DEPARTMENT
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-all"
              style={{
                background: active ? 'var(--bg-hover)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-3">
          {user?.discordAvatar && (
            <img
              src={user.discordAvatar}
              alt=""
              className="w-7 h-7 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.discordDisplayName}
            </div>
            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs py-1 px-2 rounded"
          style={{ color: 'var(--text-muted)', background: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)'
            e.currentTarget.style.color = 'var(--danger)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
