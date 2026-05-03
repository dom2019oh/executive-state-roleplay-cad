import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const db = getFirestore()

export function now() {
  return Date.now()
}

let _counter = 0
export function genId(prefix: string): string {
  _counter++
  return `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}${_counter}`
}
