'use client'

import { useSearchParams } from 'next/navigation'
import { loginWithDiscord } from '@/lib/api'
import { Suspense } from 'react'
import { Settings } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Discord access was denied. Please try again.',
  not_in_guild: 'You must be a member of the Executive State Discord server to access the CAD.',
  auth_failed: 'Authentication failed. Please try again.',
}

function LoginContent() {
  const params = useSearchParams()
  const error = params.get('error')

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(2px)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', maxWidth: 400 }}>

        {/* Logo + title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <img src="/logos/ESR.png" alt="ESR" style={{ width: 64, height: 64, objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }} />
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            Executive State CAD
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6, maxWidth: 300, fontWeight: 500 }}>
            Computer-Aided Dispatch System. Guild membership required to access.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ width: '100%', background: 'rgba(127,40,40,0.7)', border: '1px solid rgba(252,165,165,0.3)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#fca5a5', backdropFilter: 'blur(4px)' }}>
            {ERROR_MESSAGES[error] ?? 'An error occurred. Please try again.'}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <button
            onClick={loginWithDiscord}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: '#5865f2', color: '#fff', fontSize: 15, fontWeight: 700,
              letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(88,101,242,0.5)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#4752c4'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#5865f2'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Sign in with Discord
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 500 }}>
            Access is restricted to Executive State guild members only.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <a
              href="http://localhost:3001/auth/dev-login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.05)', textDecoration: 'none',
              }}
            >
              <Settings size={12} /> Dev Login
            </a>
          )}
        </div>

        {/* Dept row */}
        <div style={{ display: 'flex', gap: 20, fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {['LSPD', 'SAST', 'SAFD', 'SAMS', 'DISPATCH'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Made by — fixed to bottom */}
        <div style={{ position: 'fixed', bottom: 20, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, zIndex: 2 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.02em' }}>Made by</span>
          <img src="/buildable-logo.png" alt="" style={{ height: 16, width: 'auto', opacity: 0.85 }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: '0.01em' }}>Buildable Labs</span>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
