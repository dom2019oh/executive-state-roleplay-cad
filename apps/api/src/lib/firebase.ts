import { memDb } from './store'

const IS_DEV = !process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY === 'PLACEHOLDER'

let _db: any

if (IS_DEV) {
  console.log('[DEV] Using in-memory store — no Firebase credentials provided')
  _db = memDb
} else {
  const { initializeApp, getApps, cert } = await import('firebase-admin/app')
  const { getFirestore } = await import('firebase-admin/firestore')
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  _db = getFirestore()
}

export const db = _db

export function now() {
  return Date.now()
}

let _counter = 0
export function genId(prefix: string): string {
  _counter++
  return `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}${_counter}`
}
