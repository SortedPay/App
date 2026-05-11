import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { useStore } from '../lib/store'

type VerifiedItem = {
  label: string
  detail: string
}

const TIER_1_ITEMS: VerifiedItem[] = [
  { label: 'Mobile number', detail: '+61 04XX XXX 921' },
  { label: 'Identity (FrankieOne)', detail: 'Verified · Apr 2026' },
  { label: 'Wallet provisioned', detail: 'Solana mainnet · Privy' },
]

export default function SettingsVerification() {
  const tier = useStore((s) => s.tier)

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="VERIFICATION" />

      {/* Lime hero — VERIFIED · TIER N */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-lime border-[2px] border-ink rounded-[24px] shadow-ink-md p-5 mb-6 relative"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink/65 mb-2">
              Verified · Tier {tier}
            </p>
            <h2 className="font-display font-bold text-[28px] leading-[1] tracking-tightest text-ink mb-4">
              You&apos;re verified.
            </h2>
          </div>
          <div className="w-9 h-9 rounded-full bg-paper-elevated border border-ink flex items-center justify-center flex-shrink-0">
            <Check size={18} strokeWidth={2.8} className="text-ink" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.18em] text-ink/65 mb-1">
              Daily limit
            </p>
            <p className="font-numeric font-bold text-[20px] tracking-[-0.03em] text-ink numeric">
              $10,000
            </p>
          </div>
          <div>
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.18em] text-ink/65 mb-1">
              Per txn limit
            </p>
            <p className="font-numeric font-bold text-[20px] tracking-[-0.03em] text-ink numeric">
              $5,000
            </p>
          </div>
        </div>
      </motion.section>

      {/* VERIFIED section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2 px-1">
          Verified
        </p>
        <div className="bg-paper-elevated border border-line rounded-[16px] overflow-hidden mb-6">
          {TIER_1_ITEMS.map((item, idx) => (
            <div key={item.label}>
              {idx > 0 && <div className="h-px bg-line mx-4" />}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-deep flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[14px] tracking-tight leading-tight text-ink">
                    {item.label}
                  </div>
                  <div className="font-body text-[12px] text-ink-muted mt-0.5 leading-tight">
                    {item.detail}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Dark UNLOCK MORE card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
        className="bg-ink rounded-[20px] p-5 text-paper relative overflow-hidden"
      >
        <div className="flex items-start justify-between mb-2">
          <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-paper/65">
            Unlock more
          </p>
          <span className="inline-flex items-center bg-plum rounded-md px-2 py-0.5 font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper">
            Tier 2
          </span>
        </div>
        <h3 className="font-display font-bold text-[24px] leading-[1.05] tracking-tightest mb-4 whitespace-pre-line">
          {'Higher limits.\nMore freedom.'}
        </h3>
        <button className="w-full py-3 rounded-[12px] bg-paper-elevated text-ink font-display font-bold text-[14px] flex items-center justify-center gap-2 active:translate-y-[1px] transition-transform">
          Upgrade verification
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </motion.section>
    </Screen>
  )
}
