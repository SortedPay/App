import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { NumericKeypad } from '../components/NumericKeypad'

const PRESETS = [10, 20, 50, 100]

export default function TopUpAmount() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')

  const cents = Math.round(parseFloat(amount || '0') * 100)
  const valid = cents >= 100 // min $1

  function handleSubmit() {
    if (!valid) return
    sessionStorage.setItem('pendingTopUp', String(cents))
    navigate('/topup/payid')
  }

  const [intPart = '0', decPart = ''] = amount.split('.')
  const dollarsDisplay = intPart === '' ? '0' : parseInt(intPart || '0').toLocaleString('en-AU')

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="TOP UP" />

      {/* Hero — butter tile + ADD TO BALANCE caption */}
      <div className="flex flex-col items-center pt-2 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-14 h-14 bg-butter border-[2px] border-ink rounded-[16px] shadow-ink flex items-center justify-center mb-2"
        >
          <Plus size={24} strokeWidth={3} className="text-ink" />
        </motion.div>
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          Add to balance
        </p>
      </div>

      {/* Amount display */}
      <div className="flex flex-col items-center text-center pt-4 pb-3">
        <div className="flex items-baseline justify-center leading-none mb-2">
          <span className="font-numeric font-semibold text-[28px] mr-1 self-start mt-3 text-ink-muted">
            $
          </span>
          <motion.span
            key={dollarsDisplay}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.12 }}
            className="font-numeric font-bold text-[80px] leading-none tracking-[-0.04em] numeric text-ink"
          >
            {dollarsDisplay}
          </motion.span>
          <span className="font-numeric font-semibold text-[28px] ml-1 self-end mb-2 text-ink-muted">
            .{amount.includes('.') ? decPart.padEnd(2, '0').slice(0, 2) : '00'}
          </span>
        </div>

        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          From · CommBank · ····0421
        </p>
      </div>

      {/* Preset chips */}
      <div className="flex gap-2 mb-4 justify-center">
        {PRESETS.map((p) => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.94 }}
            onClick={() => setAmount(String(p))}
            className={`px-4 py-1.5 rounded-full border-[1.5px] font-display font-bold text-[13px] tracking-tight transition-colors ${
              amount === String(p)
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper-elevated text-ink border-line active:bg-line-soft'
            }`}
          >
            ${p}
          </motion.button>
        ))}
      </div>

      {/* CTA */}
      <button
        disabled={!valid}
        onClick={handleSubmit}
        className={`
          w-full py-4 rounded-[14px] border-[2px]
          font-display font-bold text-[16px] tracking-tight
          transition-all duration-100 mb-3
          ${
            valid
              ? 'bg-lime text-ink border-ink shadow-ink active:translate-y-[3px] active:shadow-none'
              : 'bg-line-soft text-ink-muted border-line opacity-70 cursor-not-allowed'
          }
        `}
      >
        Continue
      </button>

      <NumericKeypad value={amount} onChange={setAmount} className="mb-2" />
    </Screen>
  )
}
