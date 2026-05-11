import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { USERS_BY_HANDLE, formatAUD } from '../lib/mockData'
import { useStore } from '../lib/store'

export default function SendAmount() {
  const navigate = useNavigate()
  const { handle } = useParams<{ handle: string }>()
  const balance = useStore((s) => s.balanceCents)
  const recipient = handle ? USERS_BY_HANDLE.get(handle) : undefined

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  if (!recipient) {
    return (
      <Screen className="pt-2">
        <Header title="Not found" />
        <p className="text-ink-muted px-2 pt-6">User not found.</p>
      </Screen>
    )
  }

  const cents = Math.round(parseFloat(amount || '0') * 100)
  const valid = cents > 0 && cents <= balance

  return (
    <Screen transition="slide" className="pt-2 min-h-screen flex flex-col">
      <Header title={`To ${recipient.firstName}`} />

      <div className="flex flex-col items-center pt-4 mb-6">
        <Avatar user={recipient} size="xl" />
        <p className="font-display font-bold text-[20px] tracking-tight mt-3">
          {recipient.firstName} {recipient.lastName}
        </p>
        <p className="font-mono text-[13px] text-ink-muted">@{recipient.handle}</p>
      </div>

      <div className="text-center pt-6 pb-8">
        <p className="label-mono mb-3">Amount</p>
        <div className="flex items-start justify-center">
          <span className="font-display font-bold text-[44px] leading-[0.9] text-ink-faint mt-2 mr-0.5">$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))}
            className="font-display font-bold text-[72px] leading-none tracking-tightest text-center bg-transparent outline-none placeholder:text-ink-faint"
            style={{ width: `${Math.max(amount.length || 1, 1) + 0.5}ch` }}
            autoFocus
          />
        </div>
        <p className="text-[13px] text-ink-muted mt-2">
          Balance: {formatAUD(balance)}
        </p>
      </div>

      <input
        type="text"
        placeholder="Add a note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="input mb-6"
        maxLength={64}
      />

      <button
        className="btn btn-primary btn-lg btn-block mt-auto mb-4"
        disabled={!valid}
        onClick={() => {
          // Pass amount via URL state isn't great; use sessionStorage for demo
          sessionStorage.setItem(
            'pendingSend',
            JSON.stringify({ handle: recipient.handle, cents, note }),
          )
          navigate(`/send/${recipient.handle}/confirm`)
        }}
      >
        Review send
      </button>
    </Screen>
  )
}
