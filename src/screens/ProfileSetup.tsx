import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Screen from '../components/Screen'
import Header from '../components/Header'

const COLORS = [
  { id: 'lime', bg: 'bg-lime', text: 'text-ink' },
  { id: 'coral', bg: 'bg-coral', text: 'text-paper' },
  { id: 'sky', bg: 'bg-sky', text: 'text-ink' },
  { id: 'butter', bg: 'bg-butter', text: 'text-ink' },
  { id: 'plum', bg: 'bg-plum', text: 'text-paper' },
] as const

export default function ProfileSetup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('Hannah')
  const [lastName, setLastName] = useState('Reid')
  const [color, setColor] = useState<(typeof COLORS)[number]['id']>('lime')

  const initials = (firstName[0] || '') + (lastName[0] || '')

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="YOUR DETAILS" />

      <div className="flex-1 flex flex-col pb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pt-4"
        >
          <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-tightest text-ink mb-2">
            What should we call you?
          </h1>
          <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft max-w-[300px] mx-auto mb-6">
            Real name on the receipts. Pick a vibe colour.
          </p>
        </motion.div>

        {/* Avatar preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex justify-center mb-5"
        >
          <div
            className={`w-24 h-24 rounded-full border-[2.5px] border-ink flex items-center justify-center font-display font-bold text-[32px] tracking-tightest ${
              COLORS.find((c) => c.id === color)?.bg
            } ${COLORS.find((c) => c.id === color)?.text}`}
          >
            {initials.toUpperCase() || '·'}
          </div>
        </motion.div>

        {/* Colour swatches */}
        <div className="flex justify-center gap-2.5 mb-10">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`w-8 h-8 rounded-full ${c.bg} transition-all ${
                color === c.id
                  ? 'border-[2.5px] border-ink scale-110'
                  : 'border-[1.5px] border-ink/40'
              }`}
              aria-label={`Colour ${c.id}`}
            />
          ))}
        </div>

        {/* Name fields */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted block mb-2">
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[16px] text-ink py-[14px] px-[18px]"
              autoCapitalize="words"
            />
          </div>
          <div>
            <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted block mb-2">
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[16px] text-ink py-[14px] px-[18px]"
              autoCapitalize="words"
            />
          </div>
        </div>

        <button
          className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none mt-auto"
          disabled={!firstName.trim() || !lastName.trim()}
          onClick={() => navigate('/verifying')}
        >
          Continue
        </button>
      </div>
    </Screen>
  )
}
