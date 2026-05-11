import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Fingerprint, Loader2, ShieldCheck, Zap, CircleCheck } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { USERS_BY_HANDLE } from '../lib/mockData'
import { useStore } from '../lib/store'

export default function SendConfirm() {
  const navigate = useNavigate()
  const { handle } = useParams<{ handle: string }>()
  const send = useStore((s) => s.send)

  const pending = JSON.parse(sessionStorage.getItem('pendingSend') || '{}') as {
    handle?: string
    cents?: number
    note?: string
  }
  const recipient = handle ? USERS_BY_HANDLE.get(handle) : undefined
  const cents = pending.cents ?? 0

  const [sending, setSending] = useState(false)

  if (!recipient || cents <= 0) {
    return (
      <Screen className="pt-2">
        <Header title="Invalid" />
        <p className="text-ink-muted px-2 pt-6">Missing send details.</p>
      </Screen>
    )
  }

  // Split the amount so the cents render at smaller weight
  const dollars = Math.floor(cents / 100).toLocaleString('en-AU')
  const centsStr = String(cents % 100).padStart(2, '0')

  async function handleConfirm() {
    if (!recipient) return
    setSending(true)
    try {
      await send(recipient, cents, pending.note)
      sessionStorage.removeItem('pendingSend')
      navigate(`/send/${recipient.handle}/done`, { replace: true })
    } catch {
      setSending(false)
    }
  }

  return (
    <Screen transition="modal" className="pt-2 min-h-screen flex flex-col">
      <Header title="Confirm send" closeMode />

      {/* Main content — visual centre slightly above geometric centre */}
      <div className="flex-1 flex flex-col items-center justify-center text-center pb-16 px-6">
        <p className="font-mono font-semibold text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-3.5">
          You&apos;re sending
        </p>

        {/* Amount — uses display font, currency + cents muted */}
        <div className="flex items-baseline justify-center mb-8 leading-none">
          <span className="font-display font-semibold text-ink-muted text-[42px] mr-1 self-start mt-3">
            $
          </span>
          <span className="font-display font-bold text-ink text-[88px] tracking-[-0.05em]">
            {dollars}
          </span>
          <span className="font-display font-semibold text-ink-muted text-[36px] ml-0.5">
            .{centsStr}
          </span>
        </div>

        {/* Recipient pill */}
        <div className="inline-flex items-center gap-2.5 bg-paper-elevated border border-line rounded-full pl-1.5 pr-4 py-1.5 mb-3">
          <Avatar user={recipient} size="sm" />
          <div className="text-left">
            <p className="font-mono font-semibold text-[8px] uppercase tracking-[0.16em] text-ink-muted leading-none mb-0.5">
              To
            </p>
            <p className="font-display font-bold text-[13px] tracking-tight leading-none">
              @{recipient.handle}
            </p>
          </div>
        </div>

        {pending.note && (
          <p className="text-ink-muted text-[13px] italic">
            &ldquo;{pending.note}&rdquo;
          </p>
        )}
      </div>

      {/* Trust strip — three reasons to feel safe */}
      <div className="flex justify-center gap-4 px-6 mb-3">
        <TrustItem icon={<ShieldCheck size={10} strokeWidth={2.5} />} label="Free" />
        <TrustItem icon={<Zap size={10} strokeWidth={2.5} />} label="~1 sec" />
        <TrustItem icon={<CircleCheck size={10} strokeWidth={2.5} />} label="On Solana" />
      </div>

      {/* CTA */}
      <div className="pb-6 px-2">
        {sending ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-ink rounded-[18px] p-5 flex flex-col items-center gap-3 text-paper border-[2.5px] border-ink shadow-ink-md"
          >
            <Loader2 size={26} className="animate-spin" />
            <p className="font-display font-bold text-[16px] tracking-tight">
              Sending to @{recipient.handle}…
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
              SOLANA · CONFIRMING
            </p>
          </motion.div>
        ) : (
          <>
            <button
              onClick={handleConfirm}
              className="w-full bg-lime text-ink border-[2.5px] border-ink rounded-[18px] py-4 flex items-center justify-center gap-2.5 font-display font-bold text-[17px] tracking-tight shadow-ink-md active:translate-y-[2px] active:shadow-ink-sm transition-all"
            >
              <Fingerprint size={18} strokeWidth={2.5} />
              Hold to confirm
            </button>
            <p className="text-center font-mono font-semibold text-[9px] uppercase tracking-[0.18em] text-ink-muted mt-2.5">
              Press &amp; hold the button
            </p>
          </>
        )}
      </div>
    </Screen>
  )
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-ink-muted">
      <span className="text-ink-soft">{icon}</span>
      <span className="font-mono font-semibold text-[9px] uppercase tracking-[0.14em] whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}
