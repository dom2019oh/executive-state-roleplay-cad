'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/api'

function CallbackContent() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setToken(token)
      router.replace('/')
    } else {
      router.replace('/login?error=auth_failed')
    }
  }, [params, router])

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
