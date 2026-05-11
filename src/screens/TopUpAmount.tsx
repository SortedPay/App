import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import Header from '../components/Header'

export default function TopUpAmount() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')

  const cents = Math.round(parseFloat(amount || '0') * 100)
  const valid = cents >= 100 // min $1

  const presets = [50, 100, 200, 500]

  return (
    <Screen transition="slide" className="pt-2 min-h-screen flex flex-col">
      <Header title="Top up" />

      <div className="text-center pt-12 pb-8">
        <p className="label-mono mb-4">Add to balance</p>
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
      </div>

      <div className="grid grid-cols-4 gap-2 mb-8">
        {presets.map((p) => {
          const isSelected = amount === String(p)
          return (
            <button
              key={p}
              onClick={() => setAmount(String(p))}
              className={`btn !py-3 !px-2 !rounded-xl !text-[14px] border-2 border-ink ${
                isSelected
                  ? 'bg-lime text-ink shadow-ink-sm'
                  : 'bg-paper-elevated text-ink active:bg-line-soft'
              } transition-colors`}
            >
              ${p}
            </button>
          )
        })}
      </div>

      <button
        className="btn btn-primary btn-lg btn-block mt-auto mb-4"
        disabled={!valid}
        onClick={() => {
          sessionStorage.setItem('pendingTopUp', String(cents))
          navigate('/topup/payid')
        }}
      >
        Continue
      </button>
    </Screen>
  )
}
