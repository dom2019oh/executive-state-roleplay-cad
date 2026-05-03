'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { logout } from '@/lib/api'
import {
  LayoutDashboard,
  Radio,
  Car,
  Search,
  FileText,
  Link2,
  ScrollText,
  Scale,
  AlertTriangle,
  LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/dispatch', label: 'Dispatch', Icon: Radio, roles: ['dispatcher', 'admin'] },
  { href: '/cad', label: 'CAD', Icon: Car, roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/search', label: 'Search', Icon: Search, roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/incidents', label: 'Incidents', Icon: FileText, roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/arrests', label: 'Arrests', Icon: Link2, roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/citations', label: 'Citations', Icon: ScrollText, roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/warrants', label: 'Warrants', Icon: Scale, roles: ['officer', 'dispatcher', 'admin'] },
  { href: '/records/bolos', label: 'BOLOs', Icon: AlertTriangle, roles: ['officer', 'dispatcher', 'admin'] },
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

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleNav.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-all"
              style={{
                background: active ? 'var(--bg-hover)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-3">
          {user?.discordAvatar ? (
            <img src={user.discordAvatar} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            >
              {user?.discordDisplayName?.[0]?.toUpperCase()}
            </div>
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
          className="w-full flex items-center gap-2 text-xs py-1 px-2 rounded"
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
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
