'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function CreateCivilianPage() {
  const router = useRouter()
  const { refetch } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    ethnicity: '',
    height: '',
    weight: '',
    eyeColor: '',
    hairColor: '',
    address: '',
    phone: '',
    occupation: '',
    dlNumber: '',
    dlClass: 'C',
    dlStatus: 'valid',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/civilians', {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: new Date(form.dateOfBirth).getTime(),
        gender: form.gender,
        ethnicity: form.ethnicity,
        height: form.height,
        weight: form.weight,
        eyeColor: form.eyeColor,
        hairColor: form.hairColor,
        address: form.address,
        phone: form.phone,
        occupation: form.occupation,
        driversLicense: {
          number: form.dlNumber,
          class: form.dlClass,
          status: form.dlStatus,
          issuedAt: Date.now(),
          expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
        },
      })
      await refetch()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-start justify-center py-12 px-4"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            ES
          </div>
          <div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Create Civilian Profile
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              This is your citizenship record in the CAD system.
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-6">
          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ background: '#3f1414', border: '1px solid #7f2828', color: '#fca5a5' }}
            >
              {error}
            </div>
          )}

          <Section title="Personal Information">
            <Row>
              <Field label="First Name" required>
                <input value={form.firstName} onChange={set('firstName')} placeholder="John" required />
              </Field>
              <Field label="Last Name" required>
                <input value={form.lastName} onChange={set('lastName')} placeholder="Doe" required />
              </Field>
            </Row>
            <Row>
              <Field label="Date of Birth" required>
                <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
              </Field>
              <Field label="Gender">
                <select value={form.gender} onChange={set('gender')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Ethnicity">
                <input value={form.ethnicity} onChange={set('ethnicity')} placeholder="e.g. Hispanic" />
              </Field>
            </Row>
            <Row>
              <Field label="Height">
                <input value={form.height} onChange={set('height')} placeholder="5'11&quot;" />
              </Field>
              <Field label="Weight">
                <input value={form.weight} onChange={set('weight')} placeholder="180 lbs" />
              </Field>
              <Field label="Eye Color">
                <input value={form.eyeColor} onChange={set('eyeColor')} placeholder="Brown" />
              </Field>
              <Field label="Hair Color">
                <input value={form.hairColor} onChange={set('hairColor')} placeholder="Black" />
              </Field>
            </Row>
          </Section>

          <Section title="Contact & Employment">
            <Row>
              <Field label="Address">
                <input value={form.address} onChange={set('address')} placeholder="123 Main St, Los Santos" />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={set('phone')} placeholder="555-0100" />
              </Field>
            </Row>
            <Field label="Occupation">
              <input value={form.occupation} onChange={set('occupation')} placeholder="e.g. Mechanic" />
            </Field>
          </Section>

          <Section title="Driver's License">
            <Row>
              <Field label="License Number">
                <input value={form.dlNumber} onChange={set('dlNumber')} placeholder="DL-000000" />
              </Field>
              <Field label="Class">
                <select value={form.dlClass} onChange={set('dlClass')}>
                  <option value="none">None</option>
                  <option value="A">Class A</option>
                  <option value="B">Class B</option>
                  <option value="C">Class C</option>
                  <option value="M">Class M (Motorcycle)</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={form.dlStatus} onChange={set('dlStatus')}>
                  <option value="valid">Valid</option>
                  <option value="suspended">Suspended</option>
                  <option value="revoked">Revoked</option>
                  <option value="expired">Expired</option>
                </select>
              </Field>
            </Row>
          </Section>

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-lg font-semibold text-white"
            style={{ background: loading ? 'var(--text-muted)' : 'var(--accent)' }}
          >
            {loading ? 'Creating…' : 'Create Civilian Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="section-title">{title}</div>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))` }}>{children}</div>
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}
