'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { logout, api } from '@/lib/api'
import { ChevronDown, LogOut } from 'lucide-react'
import DeptLogo from '@/components/ui/DeptLogo'
import { DEPT_LABELS } from '@/lib/constants'

interface DropdownItem {
  href: string
  label: string
}

interface NavItem {
  label: string
  href?: string
  dropdown?: DropdownItem[]
  roles?: string[]
}

const NAV: NavItem[] = [
  { label: 'Civilian', href: '/dashboard' },
  {
    label: 'Officer',
    dropdown: [
      { href: '/cad', label: 'CAD' },
      { href: '/department/join', label: 'Join Department' },
    ],
    roles: ['officer', 'dispatcher', 'admin'],
  },
  {
    label: 'Dispatch',
    href: '/dispatch',
    roles: ['dispatcher', 'admin'],
  },
  {
    label: 'Records',
    dropdown: [
      { href: '/records/incidents', label: 'Incidents' },
      { href: '/records/arrests', label: 'Arrests' },
      { href: '/records/citations', label: 'Citations' },
      { href: '/records/warrants', label: 'Warrants' },
      { href: '/records/bolos', label: 'BOLOs' },
    ],
    roles: ['officer', 'dispatcher', 'admin'],
  },
  {
    label: 'Search',
    href: '/search',
    roles: ['officer', 'dispatcher', 'admin'],
  },
]

export default function TopNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [officerDept, setOfficerDept] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (user?.officerId) {
      api.get<{ officer: { department: string } }>('/officers/me')
        .then((d) => setOfficerDept(d.officer.department))
        .catch(() => {})
    }
  }, [user?.officerId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const visibleNav = NAV.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(user?.role ?? '')
  })

  function isActive(item: NavItem): boolean {
    if (item.href) return pathname === item.href || pathname.startsWith(item.href + '/')
    if (item.dropdown) return item.dropdown.some((d) => pathname === d.href || pathname.startsWith(d.href + '/'))
    return false
  }

  return (
    <nav
      ref={navRef}
      style={{
        height: 56,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        gap: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 32, flexShrink: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          ES
        </div>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          Executive State CAD
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        {visibleNav.map((item) => {
          const active = isActive(item)
          const isOpen = openDropdown === item.label

          if (item.dropdown) {
            return (
              <div key={item.label} style={{ position: 'relative' }}>
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: active ? 600 : 400,
                    fontSize: 14,
                    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  {item.label}
                  <ChevronDown size={13} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s' }} />
                </button>

                {isOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      minWidth: 160,
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      zIndex: 100,
                    }}
                  >
                    {item.dropdown.map((d) => {
                      const dActive = pathname === d.href || pathname.startsWith(d.href + '/')
                      return (
                        <Link
                          key={d.href}
                          href={d.href}
                          onClick={() => setOpenDropdown(null)}
                          style={{
                            display: 'block',
                            padding: '10px 16px',
                            fontSize: 13,
                            color: dActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: dActive ? 600 : 400,
                            background: dActive ? 'var(--bg-elevated)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.1s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-elevated)'
                            e.currentTarget.style.color = 'var(--text-primary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = dActive ? 'var(--bg-elevated)' : 'transparent'
                            e.currentTarget.style.color = dActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                          }}
                        >
                          {d.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: 6,
                background: 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                textDecoration: 'none',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Right: dept logo + user + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

        {/* Department logo */}
        {officerDept && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12, borderRight: '1px solid var(--border)' }}>
            <DeptLogo dept={officerDept} size={28} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1 }}>Department</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{officerDept}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.discordDisplayName}</span>
          {user?.discordAvatar ? (
            <img src={user.discordAvatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {user?.discordDisplayName?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: 12,
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--danger)'
            e.currentTarget.style.borderColor = 'var(--danger)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </nav>
  )
}
