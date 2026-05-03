'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Root() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
    else if (!user.civilianId) router.replace('/civilian/create')
    else router.replace('/dashboard')
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
    </div>
  )
}
