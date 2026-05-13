import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Building2, FileBadge, Banknote, Zap } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { useStore } from '../lib/store'
import { haptic, playChime } from '../lib/chime'

/**
 * SettingsVerifyUpgrade — Tier 1 → Tier 2 upgrade flow.
 *
 * Real product would push to FrankieOne's hosted bio + proof-of-address flow.
 * Demo simulates the wait + flips the tier in the store.
 *
 * Tier 2 benefits:
 *   - $50k daily / $25k per-tx (from $10k / $5k)
 *   - International sends (later)
 *   - Higher referral payouts
 *   - Custom @handle (premium handles)
 */
export default function SettingsVerifyUpgrade() {
  const navigate = useNavigate()
  const tier = useStore((s) => s.tier)
  const setTier = useStore((s) => s.setTier)
  const [stage, setStage] = useState<'overview' | 'submitting' | 'done'>('overview')

  async function startUpgrade() {
    haptic(12)
    setStage('submitting')
    // Simulate FrankieOne processing
    await new Promise((r) => setTimeout(r, 2200))
    setTier(2)
    playChime('success')
    setStage('done')
    setTimeout(() => navigate('/settings/verification'), 1400)
  }

  // Already tier 2 — show happy state
  if (tier === 2) {
    return (
      <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
        <Header title="VERIFICATION" />
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="w-20 h-20 bg-lime border-[2.5px] border-ink rounded-full flex items-center justify-center mb-5 shadow-ink-md"
          >
            <Check size={36} strokeWidth={3} className="text-ink" />
          </motion.div>
          <h1 className="font-display font-bold text-[28px] tracking-tightest mb-2">
            You&apos;re Tier 2.
          </h1>
          <p className="font-body text-[14px] text-ink-soft max-w-[280px] mb-6">
            Max limits unlocked. International sends coming soon.
          </p>
          <button
            onClick={() => navigate('/settings/verification')}
            className="px-5 py-2.5 rounded-full bg-ink text-paper font-display font-bold text-[13px]"
          >
            Back to verification
          </button>
        </div>
      </Screen>
    )
  }

  if (stage === 'submitting') {
    return (
      <Screen transition="fade" className="min-h-screen flex flex-col px-6">
        <Header title="VERIFICATION" />
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full border-[3px] border-ink border-t-transparent mb-5"
          />
          <h2 className="font-display font-bold text-[22px] tracking-tightest mb-1">
            Cross-checking with FrankieOne…
          </h2>
          <p className="font-body text-[13px] text-ink-muted">Usually takes a few seconds.</p>
        </div>
      </Screen>
    )
  }

  if (stage === 'done') {
    return (
      <Screen transition="fade" className="min-h-screen flex flex-col px-6">
        <Header title="VERIFICATION" />
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-20 h-20 bg-lime border-[2.5px] border-ink rounded-full flex items-center justify-center mb-5 shadow-ink-md"
          >
            <Check size={36} strokeWidth={3} className="text-ink" />
          </motion.div>
          <h1 className="font-display font-bold text-[32px] leading-[0.95] tracking-tightest mb-2">
            Tier 2.
          </h1>
          <p className="font-body text-[14px] text-ink-soft">Max limits unlocked.</p>
        </div>
      </Screen>
    )
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="VERIFICATION" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-2"
      >
        <span className="inline-flex items-center bg-plum rounded-md px-2 py-0.5 font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-paper mb-3">
          Tier 2
        </span>
        <h1 className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-2 whitespace-pre-line">
          {'Higher limits.\nMore freedom.'}
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft mb-6">
          One quick check with FrankieOne. Takes about 30 seconds.
        </p>
      </motion.div>

      {/* Benefits list */}
      <ul className="bg-paper-elevated border border-line rounded-[16px] divide-y divide-line mb-5 overflow-hidden">
        <BenefitRow
          icon={<Zap size={18} strokeWidth={2.4} className="text-ink" />}
          title="$50k daily limit"
          subtitle="Up from $10k"
        />
        <BenefitRow
          icon={<Banknote size={18} strokeWidth={2.4} className="text-ink" />}
          title="$25k per transaction"
          subtitle="Up from $5k"
        />
        <BenefitRow
          icon={<Building2 size={18} strokeWidth={2.4} className="text-ink" />}
          title="Business top-ups"
          subtitle="From PayID or ABN-linked accounts"
        />
        <BenefitRow
          icon={<FileBadge size={18} strokeWidth={2.4} className="text-ink" />}
          title="Premium @handles"
          subtitle="Reserve up to 3 short handles"
        />
      </ul>

      {/* What you'll need */}
      <div className="bg-lime-soft border border-lime-deep rounded-[14px] px-4 py-3 mb-5">
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink mb-2">
          You&apos;ll need
        </p>
        <ul className="space-y-1.5 font-body text-[13px] text-ink leading-[1.4]">
          <li>· Aussie driver&apos;s licence or passport</li>
          <li>· Proof of address (under 3 months old)</li>
          <li>· About a minute</li>
        </ul>
      </div>

      <div className="flex-1" />

      <motion.button
        whileTap={{ scale: 0.985 }}
        onClick={startUpgrade}
        className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink flex items-center justify-center gap-2 active:translate-y-[2px] active:shadow-none transition-all"
      >
        Start Tier 2 verification
        <ArrowRight size={16} strokeWidth={2.6} />
      </motion.button>
      <p className="text-center font-body text-[11px] text-ink-muted mt-3">
        Verified by FrankieOne. AUSTRAC-compliant.
      </p>
    </Screen>
  )
}

function BenefitRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 bg-lime border-[1.5px] border-ink rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
          {title}
        </div>
        <div className="font-body text-[12px] text-ink-muted mt-0.5">{subtitle}</div>
      </div>
    </li>
  )
}
