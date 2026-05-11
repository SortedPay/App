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
  const [color, setColor] = useState<typeof COLORS[number]['id']>('lime')

  const initials = (firstName[0] || '') + (lastName[0] || '')

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col">
      <Header title="Your details" />

      <div className="flex-1 flex flex-col pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-6"
        >
          <h1 className="font-display font-bold text-[40px] leading-[0.95] tracking-tighter text-ink mb-3">
            What should<br />
            we call you?
          </h1>
          <p className="text-ink-soft mb-10 text-[15px] max-w-[28ch]">
            Real name on the receipts. Pick a vibe colour.
          </p>

          {/* Avatar preview */}
          <div className="flex justify-center mb-8">
            <motion.div
              key={color}
              initial={{ scale: 0.85, rotate: -3 }}
              animate={{ scale: 1, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-28 h-28 rounded-full border-[3px] border-ink flex items-center justify-center font-display font-bold text-[36px] tracking-tightest shadow-ink-md ${
                COLORS.find((c) => c.id === color)?.bg
              } ${COLORS.find((c) => c.id === color)?.text}`}
            >
              {initials.toUpperCase() || '·'}
            </motion.div>
          </div>

          {/* Color picker */}
          <div className="flex justify-center gap-3 mb-10">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                className={`w-10 h-10 rounded-full border-[2.5px] border-ink ${c.bg} transition-transform ${
                  color === c.id ? 'scale-125 ring-2 ring-offset-2 ring-offset-paper ring-ink' : ''
                }`}
                aria-label={`Color ${c.id}`}
              />
            ))}
          </div>

          {/* Name fields */}
          <div className="space-y-3 mb-8">
            <div>
              <label className="label-mono block mb-1.5">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input"
                autoCapitalize="words"
              />
            </div>
            <div>
              <label className="label-mono block mb-1.5">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input"
                autoCapitalize="words"
              />
            </div>
          </div>
        </motion.div>

        <button
          className="btn btn-primary btn-lg btn-block mt-auto"
          disabled={!firstName.trim() || !lastName.trim()}
          onClick={() => navigate('/ready')}
        >
          Continue
        </button>
      </div>
    </Screen>
  )
}
