'use client'



import { useState } from 'react'
import { Wallet, Building2 } from 'lucide-react'

interface Account {
  id: string
  type: 'personal_checking' | 'personal_savings' | 'business_checking' | 'business_savings'
  name: string
  balance: number
  accountNumber: string
}

const ACCOUNT_TYPES = [
  { value: 'personal_checking', label: 'Checking' },
  { value: 'personal_savings', label: 'Savings' },
  { value: 'business_checking', label: 'Business Checking' },
  { value: 'business_savings', label: 'Business Savings' },
]

export default function MazeBankPage() {
  const [accounts] = useState<Account[]>([])
  const [cashBalance] = useState(0)
  const [showNewAccount, setShowNewAccount] = useState(false)
  const [newAccountType, setNewAccountType] = useState('')

  const personalAccounts = accounts.filter((a) => a.type.startsWith('personal'))
  const businessAccounts = accounts.filter((a) => a.type.startsWith('business'))

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {/* Left panel */}
      <div style={{
        width: 320,
        borderRight: '1px solid #1e1e1e',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Personal Accounts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#555', textTransform: 'uppercase', marginBottom: 10 }}>
            <Wallet size={12} /> Personal Accounts
          </div>

          {personalAccounts.length === 0 ? (
            <button
              onClick={() => { setShowNewAccount(true); setNewAccountType('personal_checking') }}
              style={accountBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1c1c1c')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#161616')}
            >
              Open New Account
            </button>
          ) : (
            <>
              {personalAccounts.map((a) => <AccountCard key={a.id} account={a} />)}
              <button onClick={() => { setShowNewAccount(true); setNewAccountType('personal_checking') }} style={{ ...accountBtnStyle, marginTop: 8 }}>
                Open New Account
              </button>
            </>
          )}
        </div>

        {/* Business Accounts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#555', textTransform: 'uppercase', marginBottom: 10 }}>
            <Building2 size={12} /> Business Accounts
          </div>

          {businessAccounts.length === 0 ? (
            <button
              onClick={() => { setShowNewAccount(true); setNewAccountType('business_checking') }}
              style={accountBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1c1c1c')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#161616')}
            >
              Open New Account
            </button>
          ) : (
            <>
              {businessAccounts.map((a) => <AccountCard key={a.id} account={a} />)}
              <button onClick={() => { setShowNewAccount(true); setNewAccountType('business_checking') }} style={{ ...accountBtnStyle, marginTop: 8 }}>
                Open New Account
              </button>
            </>
          )}
        </div>

        {/* Cash Balance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          background: '#161616',
          border: '1px solid #222',
          borderRadius: 8,
        }}>
          <Wallet size={16} style={{ color: '#555', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, color: '#555' }}>Cash Balance</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {accounts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#333' }}>
            <Wallet size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No account selected.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Open an account to get started.</p>
          </div>
        ) : (
          <div style={{ color: '#555', fontSize: 13 }}>Select an account from the left panel.</div>
        )}
      </div>

      {/* New Account Modal */}
      {showNewAccount && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 28, width: 480 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Create New Bank Account</div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Account Type</div>
              <div style={{ background: '#0d0d0d', border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: '#0d0d0d', color: newAccountType ? '#fff' : '#444', fontSize: 14, border: 'none', outline: 'none' }}
                >
                  <option value="" disabled>-- Select Account Type --</option>
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {newAccountType === '' && (
                  <div style={{ borderTop: '1px solid #1a1a1a' }}>
                    {ACCOUNT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setNewAccountType(t.value)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px', background: 'transparent', color: '#ccc', fontSize: 14, cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a1a')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowNewAccount(false)}
                style={{ padding: '9px 18px', borderRadius: 6, background: '#1c1c1c', color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={!newAccountType}
                style={{ padding: '9px 18px', borderRadius: 6, background: newAccountType ? '#c0392b' : '#333', color: newAccountType ? '#fff' : '#666', fontSize: 13, fontWeight: 600, cursor: newAccountType ? 'pointer' : 'not-allowed' }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountCard({ account }: { account: Account }) {
  return (
    <div style={{ padding: '10px 14px', background: '#161616', border: '1px solid #222', borderRadius: 8, marginBottom: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{account.name}</div>
      <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>#{account.accountNumber}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 6 }}>${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
    </div>
  )
}

const accountBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: '#161616',
  border: '1px solid #222',
  borderRadius: 8,
  color: '#888',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'background 0.12s',
}
