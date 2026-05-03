'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { logout } from '@/lib/api'
import {
  Home,
  User,
  Radio,
  Car,
  Search,
  FileText,
  Link2,
  ScrollText,
  Scale,
  AlertTriangle,
  RefreshCw,
  LogOut,
} from 'lucide-react'

const NAV_TOP = [
  { href: '/dashboard', label: 'Home', Icon: Home },
  { href: '/civilian/create', label: 'Civilian', Icon: User, hideIf: 'hasCivilian' },
  { href: '/dashboard', label: 'Civilian', Icon: User, showIf: 'hasCivilian' },
]

const NAV_OFFICER = [
  { href: '/cad', label: 'CAD', Icon: Car },
  { href: '/dispatch', label: 'Dispatch', Icon: Radio, roles: ['dispatcher', 'admin'] },
  { href: '/search', label: 'Search', Icon: Search },
]

const NAV_RECORDS = [
  { href: '/records/incidents', label: 'Incidents', Icon: FileText },
  { href: '/records/arrests', label: 'Arrests', Icon: Link2 },
  { href: '/records/citations', label: 'Citations', Icon: ScrollText },
  { href: '/records/warrants', label: 'Warrants', Icon: Scale },
  { href: '/records/bolos', label: 'BOLOs', Icon: AlertTriangle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, refetch } = useAuth()

  const isOfficer = ['officer', 'dispatcher', 'admin'].includes(user?.role ?? '')

  function NavItem({ href, label, Icon, roles }: { href: string; label: string; Icon: React.ElementType; roles?: string[] }) {
    if (roles && !roles.includes(user?.role ?? '')) return null
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 14,
          textDecoration: 'none',
          background: active ? 'var(--bg-elevated)' : 'transparent',
          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: active ? 600 : 400,
          transition: 'all 0.12s',
        }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
      >
        <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
        {label}
      </Link>
    )
  }

  function Divider() {
    return <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
  }

  function SectionLabel({ label }: { label: string }) {
    return (
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 12px 2px' }}>
        {label}
      </div>
    )
  }

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logos/ESR.png" alt="ESR" style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.2 }}>Executive State</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>CAD System</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        <NavItem href="/dashboard" label="Home" Icon={Home} />
        <NavItem href="/dashboard" label="Civilian" Icon={User} />

        {isOfficer && (
          <>
            <Divider />
            <SectionLabel label="Officer" />
            {NAV_OFFICER.map(({ href, label, Icon, roles }) => (
              <NavItem key={href} href={href} label={label} Icon={Icon} roles={roles as string[] | undefined} />
            ))}
            <Divider />
            <SectionLabel label="Records" />
            {NAV_RECORDS.map(({ href, label, Icon }) => (
              <NavItem key={href} href={href} label={label} Icon={Icon} />
            ))}
          </>
        )}

        <Divider />

        {/* Maze Bank */}
        {/* Maze Bank — custom icon */}
        <Link
          href="/maze-bank"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 14,
            textDecoration: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <img src="/logos/maze-bank-icon.png" alt="Maze Bank" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
          Maze Bank
        </Link>
      </nav>

      {/* Bottom — user + resync + logout */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', marginBottom: 4 }}>
          {user?.discordAvatar ? (
            <img src={user.discordAvatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
              {user?.discordDisplayName?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.discordDisplayName}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>

        <button
          onClick={refetch}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 2, transition: 'all 0.12s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <RefreshCw size={14} /> Resync
        </button>

        <button
          onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', transition: 'all 0.12s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#3f141422'; e.currentTarget.style.color = 'var(--danger)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
