import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Smartphone,
  Fingerprint,
  KeyRound,
  LogOut,
  Check,
} from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { Toggle } from '../components/Toggle'
import { haptic, playChime } from '../lib/chime'

/**
 * SettingsSecurity — 2FA, biometric, device management.
 *
 * In v0.4 these are all UI-only toggles. v0.5 wires them to Privy's MFA APIs
 * and persists state. For now they live in component state so the user can
 * see the interaction.
 */
export default function SettingsSecurity() {
  const [twoFA, setTwoFA] = useState(true)
  const [biometric, setBiometric] = useState(true)
  const [paymentPin, setPaymentPin] = useState(false)
  const [twoFAStage, setTwoFAStage] = useState<'idle' | 'setup' | 'done'>('idle')
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])

  function toggle2FA(next: boolean) {
    haptic(8)
    if (next && !twoFA) {
      // Switching ON — show setup flow
      setTwoFAStage('setup')
    } else {
      // Switching OFF — instant (in real product would require re-auth)
      setTwoFA(next)
    }
  }

  function confirm2FA() {
    haptic(15)
    setTwoFA(true)
    setTwoFAStage('done')
    playChime('accent')
    setTimeout(() => setTwoFAStage('idle'), 1400)
  }

  const codeFilled = code.every((d) => d.length === 1)

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="SECURITY" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-2 mb-5"
      >
        <h1 className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-2">
          Locked down.
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft">
          Your @handle, your money, your control.
        </p>
      </motion.div>

      {/* Security score card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-lime border-[2px] border-ink rounded-[16px] px-4 py-3.5 mb-5 flex items-center gap-3 shadow-ink-sm"
      >
        <div className="w-10 h-10 bg-ink rounded-full flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={20} strokeWidth={2.4} className="text-lime" />
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-[15px] tracking-tight leading-[1.2] text-ink">
            Your account is {twoFA && biometric ? 'fully' : 'mostly'} secure
          </p>
          <p className="font-body text-[12px] text-ink/65 mt-0.5">
            {twoFA && biometric
              ? 'Both 2FA and biometrics on.'
              : !twoFA
              ? 'Turn on 2FA for full protection.'
              : 'Turn on biometrics for faster sign-in.'}
          </p>
        </div>
      </motion.div>

      {/* Section: Sign-in */}
      <Section title="Sign-in">
        <ToggleRow
          icon={<KeyRound size={18} strokeWidth={2.4} />}
          label="Two-factor auth"
          sub="Six-digit code from your authenticator app"
          on={twoFA}
          onChange={toggle2FA}
        />
        <Divider />
        <ToggleRow
          icon={<Fingerprint size={18} strokeWidth={2.4} />}
          label="Face ID / Touch ID"
          sub="Sign in with biometrics on this device"
          on={biometric}
          onChange={(v) => {
            haptic(8)
            setBiometric(v)
          }}
        />
        <Divider />
        <ToggleRow
          icon={<KeyRound size={18} strokeWidth={2.4} />}
          label="Payment PIN"
          sub="Require a PIN for every send over $200"
          on={paymentPin}
          onChange={(v) => {
            haptic(8)
            setPaymentPin(v)
          }}
        />
      </Section>

      {/* Section: Devices */}
      <Section title="Devices">
        <DeviceRow
          name="This iPhone"
          detail="Sydney · just now"
          current
        />
        <Divider />
        <DeviceRow
          name="MacBook Pro · Safari"
          detail="Sydney · 2 days ago"
        />
      </Section>

      {/* Section: Account actions */}
      <Section>
        <button
          onClick={() => {
            haptic(10)
            if (confirm('Sign out of all other devices?')) {
              // mock — would call /api/sessions/revoke
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-line-soft transition-colors text-left"
        >
          <LogOut size={18} strokeWidth={2.4} className="text-ink" />
          <div className="flex-1">
            <div className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
              Sign out everywhere else
            </div>
            <div className="font-body text-[12px] text-ink-muted mt-0.5">
              Keeps this device, signs out the rest
            </div>
          </div>
        </button>
      </Section>

      <p className="text-center font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-faint mt-3">
        Backed by Privy · TEE-secured wallet
      </p>

      {/* 2FA setup bottom sheet — appears when toggling on */}
      <AnimatePresence>
        {twoFAStage === 'setup' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-ink/40 flex items-end justify-center"
            onClick={() => setTwoFAStage('idle')}
          >
            <motion.div
              initial={{ y: 360 }}
              animate={{ y: 0 }}
              exit={{ y: 360 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] bg-paper border-t-[2.5px] border-ink rounded-t-[24px] px-6 pt-5 pb-7"
            >
              <div className="w-12 h-1.5 bg-line-soft rounded-full mx-auto mb-4" />
              <h2 className="font-display font-bold text-[24px] tracking-tightest mb-1">
                Set up 2FA
              </h2>
              <p className="font-body text-[13px] text-ink-soft mb-5 leading-[1.45]">
                We sent a 6-digit code to your authenticator app. Pop it in.
              </p>
              <div className="grid grid-cols-6 gap-2 mb-5">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const next = [...code]
                      next[idx] = e.target.value.replace(/\D/g, '').slice(-1)
                      setCode(next)
                    }}
                    className={`w-full h-[48px] min-w-0 text-center font-display font-bold text-[22px] tracking-tighter bg-paper-elevated rounded-[12px] border-[1.5px] outline-none transition-colors ${
                      digit ? 'border-ink text-ink' : 'border-line text-ink-soft focus:border-ink'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={confirm2FA}
                disabled={!codeFilled}
                className={`w-full py-4 rounded-[14px] border-[2px] font-display font-bold text-[16px] tracking-tight transition-all ${
                  codeFilled
                    ? 'bg-lime text-ink border-ink shadow-ink active:translate-y-[2px] active:shadow-none'
                    : 'bg-line-soft text-ink-muted border-line'
                }`}
              >
                {codeFilled ? 'Turn on 2FA' : 'Enter all 6 digits'}
              </button>
            </motion.div>
          </motion.div>
        )}

        {twoFAStage === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-ink text-paper px-5 py-3 rounded-2xl shadow-ink-md flex items-center gap-2.5 font-display font-semibold text-[14px] tracking-tight"
          >
            <Check size={14} strokeWidth={3} className="text-lime" />
            2FA enabled
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {title && (
        <h2 className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted px-2 mb-2">
          {title}
        </h2>
      )}
      <div className="bg-paper-elevated border border-line rounded-[16px] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-line mx-4" />
}

function ToggleRow({
  icon,
  label,
  sub,
  on,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  on: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="text-ink flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
          {label}
        </div>
        <div className="font-body text-[12px] text-ink-muted mt-0.5 leading-[1.3]">{sub}</div>
      </div>
      <Toggle on={on} onToggle={onChange} label={label} />
    </div>
  )
}

function DeviceRow({
  name,
  detail,
  current,
}: {
  name: string
  detail: string
  current?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Smartphone size={18} strokeWidth={2.4} className="text-ink flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
            {name}
          </span>
          {current && (
            <span className="inline-flex items-center bg-lime border border-ink rounded-md px-1.5 py-0.5 font-mono font-semibold text-[8px] uppercase tracking-[0.14em] text-ink">
              This
            </span>
          )}
        </div>
        <div className="font-body text-[12px] text-ink-muted mt-0.5 leading-[1.3]">{detail}</div>
      </div>
      {!current && (
        <button
          onClick={() => haptic(8)}
          className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-coral"
        >
          Sign out
        </button>
      )}
    </div>
  )
}
