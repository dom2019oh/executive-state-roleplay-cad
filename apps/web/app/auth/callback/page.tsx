'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

function CallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { refetch } = useAuth()

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      router.replace('/login?error=auth_failed')
      return
    }
    setToken(token)
    refetch().then(() => router.replace('/'))
  }, [params, router, refetch])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--text-muted)' }}>Verifying…</p>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  )
}
