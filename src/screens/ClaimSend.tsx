import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Gift } from 'lucide-react'
import Screen from '../components/Screen'
import Confetti from '../components/Confetti'
import { api } from '../lib/api/client'
import type { ClaimPreview } from '../lib/api/types'
import { stashClaimCode } from '../lib/auth'
import { formatAUD } from '../lib/model'
import { useStore, SortedError } from '../lib/store'
import { playChime } from '../lib/chime'

/**
 * /c/:code — the link in the SMS. Shows who sent what before asking for
 * anything; a signed-in user claims in one tap, a newcomer parks the code
 * and comes back here after onboarding (Home redirects to it).
 */
export default function ClaimSend() {
  const navigate = useNavigate()
  const { code = '' } = useParams<{ code: string }>()
  const status = useStore((s) => s.session.status)
  const claimSms = useStore((s) => s.claimSms)
  const [preview, setPreview] = useState<ClaimPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState<number | null>(null)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    if (!code) return
    let cancelled = false
    api.sends
      .previewClaim(code)
      .then((p) => !cancelled && setPreview(p))
      .catch((e: unknown) => !cancelled && setError(e instanceof SortedError ? e.message : "That claim link isn't valid."))
    return () => {
      cancelled = true
    }
  }, [code])

  async function claim() {
    if (claiming) return
    setClaiming(true)
    setError(null)
    try {
      const tx = await claimSms(code)
      stashClaimCode(null)
      setClaimed(tx.amountCents)
      playChime('success')
      setConfetti(true)
    } catch (e) {
      setError(e instanceof SortedError ? e.message : "Couldn't claim that. Try again.")
      setClaiming(false)
    }
  }

  function getStarted() {
    stashClaimCode(code)
    navigate('/welcome')
  }

  const from = preview?.from.firstName || (preview?.from.handle ? `@${preview.from.handle}` : 'Someone')
  const open = preview?.status === 'pending'

  return (
    <Screen transition="fade" className="min-h-screen flex flex-col px-6 pb-6">
      <Confetti active={confetti} originY="36%" />
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="w-20 h-20 bg-lime border-[2.5px] border-ink rounded-[24px] shadow-ink-md flex items-center justify-center mb-6"
        >
          {claimed !== null ? <Check size={36} strokeWidth={3} className="text-ink" /> : <Gift size={32} strokeWidth={2.6} className="text-ink" />}
        </motion.div>

        {claimed !== null ? (
          <>
            <h1 className="font-display font-bold text-[40px] leading-none tracking-tightest text-ink mb-3">Yours.</h1>
            <p className="font-body text-[16px] text-ink-soft">
              <span className="font-bold text-ink">{formatAUD(claimed)}</span> <span className="text-ink-muted">is in your balance.</span>
            </p>
          </>
        ) : preview ? (
          <>
            <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">{from} sent you</p>
            <h1 className="font-numeric font-bold text-[56px] leading-none tracking-[-0.04em] text-ink mb-3 numeric">{formatAUD(preview.amountCents)}</h1>
            <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft max-w-[290px]">
              {open
                ? status === 'signed_in'
                  ? 'Tap to move it into your balance.'
                  : 'Set up Sorted in about a minute and it lands in your balance.'
                : preview.status === 'claimed'
                  ? 'This one has already been claimed.'
                  : preview.status === 'undone'
                    ? 'The sender took this one back.'
                    : 'This claim link has expired.'}
            </p>
          </>
        ) : (
          <p className="font-body text-[14px] text-ink-muted">{error ?? 'Checking that link…'}</p>
        )}
      </div>

      {error && preview && <p className="text-center font-body text-[12px] text-coral mb-3">{error}</p>}

      {claimed !== null ? (
        <button
          onClick={() => navigate('/home', { replace: true })}
          className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all"
        >
          Take me in
        </button>
      ) : open && status === 'signed_in' ? (
        <button
          onClick={claim}
          disabled={claiming}
          className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-70"
        >
          {claiming ? 'Claiming…' : 'Claim it'}
        </button>
      ) : open && status !== 'booting' ? (
        <button
          onClick={getStarted}
          className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all"
        >
          Get started
        </button>
      ) : preview ? (
        <button
          onClick={() => navigate(status === 'signed_in' ? '/home' : '/welcome', { replace: true })}
          className="w-full py-4 rounded-[14px] bg-paper-elevated border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all"
        >
          {status === 'signed_in' ? 'Back home' : 'Open Sorted'}
        </button>
      ) : null}
    </Screen>
  )
}
