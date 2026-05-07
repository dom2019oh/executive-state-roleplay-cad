'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

function calcAge(dob: string): string {
  if (!dob) return ''
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age >= 0 ? String(age) : ''
}

export default function CreateCivilianPage() {
  const router = useRouter()
  const { refetch } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    dateOfBirth: '',
    sex: 'male',
    aliases: '',
    address: '',
    zipCode: '',
    occupation: '',
    height: '',
    weight: '',
    skinTone: '',
    hairColor: '',
    eyeColor: '',
    phone: '',
    dlNumber: '',
    dlClass: 'C',
    dlStatus: 'valid',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const age = calcAge(form.dateOfBirth)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/civilians', {
        firstName: form.firstName,
        lastName: form.lastName,
        middleInitial: form.middleInitial,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).getTime() : undefined,
        gender: form.sex,
        aliases: form.aliases,
        address: form.address,
        zipCode: form.zipCode,
        occupation: form.occupation,
        height: form.height,
        weight: form.weight,
        ethnicity: form.skinTone,
        hairColor: form.hairColor,
        eyeColor: form.eyeColor,
        phone: form.phone,
        driversLicense: form.dlNumber
          ? {
              number: form.dlNumber,
              class: form.dlClass,
              status: form.dlStatus,
              issuedAt: Date.now(),
              expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
            }
          : undefined,
      })
      await refetch()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: 8,
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
    fontSize: 13,
    transition: 'border-color 0.15s',
  } as React.CSSProperties

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '48px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 700 }}>
        {/* Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 32,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10, marginBottom: 28 }}>
            <img src="/logos/civilian-operations.png" alt="Civilian Operations" style={{ width: 72, height: 72, objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Register New Civilian</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>This is your citizenship record in the CAD system.</div>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: '#3f1414',
                border: '1px solid #7f2828',
                color: '#fca5a5',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Row 1: First Name | Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                value={form.firstName}
                onChange={set('firstName')}
                placeholder="First Name"
                required
                style={inputStyle}
              />
              <input
                value={form.lastName}
                onChange={set('lastName')}
                placeholder="Last Name"
                required
                style={inputStyle}
              />
            </div>

            {/* Row 2: Middle Initial | Date of Birth */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                value={form.middleInitial}
                onChange={set('middleInitial')}
                placeholder="Middle Initial (optional)"
                maxLength={1}
                style={inputStyle}
              />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={set('dateOfBirth')}
                placeholder="Date of Birth"
                required
                style={inputStyle}
              />
            </div>

            {/* Row 3: Age (readonly) | Sex */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                value={age ? `Age: ${age}` : ''}
                readOnly
                placeholder="Age (auto-calculated)"
                style={{ ...inputStyle, background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'default' }}
              />
              <select value={form.sex} onChange={set('sex')} style={inputStyle}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Row 4: Aliases | Residence/Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                value={form.aliases}
                onChange={set('aliases')}
                placeholder="Aliases (optional)"
                style={inputStyle}
              />
              <input
                value={form.address}
                onChange={set('address')}
                placeholder="Residence / Address"
                style={inputStyle}
              />
            </div>

            {/* Row 5: Zip Code | Occupation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                value={form.zipCode}
                onChange={set('zipCode')}
                placeholder="Zip Code"
                style={inputStyle}
              />
              <input
                value={form.occupation}
                onChange={set('occupation')}
                placeholder="Occupation"
                style={inputStyle}
              />
            </div>

            {/* Row 6: Height | Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                value={form.height}
                onChange={set('height')}
                placeholder={"Height (e.g. 5'11\")"}
                style={inputStyle}
              />
              <input
                value={form.weight}
                onChange={set('weight')}
                placeholder="Weight (e.g. 160lbs)"
                style={inputStyle}
              />
            </div>

            {/* Row 7: Skin Tone | Hair Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                value={form.skinTone}
                onChange={set('skinTone')}
                placeholder="Skin Tone / Ethnicity"
                style={inputStyle}
              />
              <select value={form.hairColor} onChange={set('hairColor')} style={inputStyle}>
                <option value="">Hair Color</option>
                <option value="Black">Black</option>
                <option value="Brown">Brown</option>
                <option value="Blonde">Blonde</option>
                <option value="Red">Red</option>
                <option value="Gray">Gray</option>
                <option value="White">White</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Row 8: Eye Color | Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <select value={form.eyeColor} onChange={set('eyeColor')} style={inputStyle}>
                <option value="">Eye Color</option>
                <option value="Brown">Brown</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Hazel">Hazel</option>
                <option value="Gray">Gray</option>
                <option value="Other">Other</option>
              </select>
              <input
                value={form.phone}
                onChange={set('phone')}
                placeholder="Phone Number"
                style={inputStyle}
              />
            </div>

            {/* DL section divider */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                Driver's License (optional)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <input
                  value={form.dlNumber}
                  onChange={set('dlNumber')}
                  placeholder="DL Number"
                  style={inputStyle}
                />
                <select value={form.dlClass} onChange={set('dlClass')} style={inputStyle}>
                  <option value="none">No License</option>
                  <option value="A">Class A</option>
                  <option value="B">Class B</option>
                  <option value="C">Class C</option>
                  <option value="M">Class M (Motorcycle)</option>
                </select>
                <select value={form.dlStatus} onChange={set('dlStatus')} style={inputStyle}>
                  <option value="valid">Valid</option>
                  <option value="suspended">Suspended</option>
                  <option value="revoked">Revoked</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => window.history.back()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  background: loading ? 'var(--text-muted)' : 'var(--success)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  border: 'none',
                }}
              >
                {loading ? 'Creating…' : 'Create Civilian'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
