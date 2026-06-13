import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Mail, Receipt } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { useStore } from '../lib/store'
import { formatAUD } from '../lib/mockData'
import {
  recentFYs,
  summariseFY,
  buildCSV,
  downloadCSV,
  FYRange,
} from '../lib/taxReport'
import { haptic, playChime } from '../lib/chime'

/**
 * Tax — Australian financial year report screen.
 *
 * Pick an FY (current + 2 prior). See total in/out/card spend, transaction count.
 * Download CSV ready for ATO purposes or to forward to your accountant.
 *
 * Why this matters: every Aussie freelancer / sole trader hates tax season
 * because cobbling together transaction history from 4 banks takes hours.
 * Sorted's instant CSV is genuinely useful — and a differentiator.
 */
export default function Tax() {
  const transactions = useStore((s) => s.transactions)
  const user = useStore((s) => s.user)

  const fys = useMemo(() => recentFYs(3), [])
  const [selected, setSelected] = useState<FYRange>(fys[0])
  const summary = useMemo(() => summariseFY(transactions, selected), [transactions, selected])
  const [emailSent, setEmailSent] = useState(false)

  function handleDownloadCSV() {
    haptic(15)
    const csv = buildCSV(transactions, selected, user.handle)
    const filename = `sorted-${user.handle}-${selected.label.toLowerCase().replace(/\s+/g, '-')}.csv`
    downloadCSV(csv, filename)
    playChime('accent')
  }

  function handleEmailMe() {
    // Mock — in v0.5 this calls /api/tax/email which sends a signed PDF + CSV
    haptic(10)
    setEmailSent(true)
    setTimeout(() => setEmailSent(false), 2500)
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="TAX" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-2"
      >
        <h1 className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-2">
          Tax sorted.
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft mb-6">
          Every transaction, every cent. Ready for the ATO or your accountant.
        </p>
      </motion.div>

      {/* FY chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto -mx-6 px-6 scrollbar-none">
        {fys.map((fy) => {
          const active = fy.label === selected.label
          return (
            <motion.button
              key={fy.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                haptic(6)
                setSelected(fy)
              }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full border-[1.5px] font-display font-bold text-[13px] tracking-tight transition-colors ${
                active
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper-elevated text-ink border-line active:bg-line-soft'
              }`}
            >
              {fy.label}
              {fy.current && (
                <span className={`ml-1.5 font-mono text-[9px] tracking-[0.16em] ${active ? 'text-lime' : 'text-ink-muted'}`}>
                  · LIVE
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Summary hero card */}
      <motion.section
        key={selected.label}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-ink rounded-[20px] px-5 pt-5 pb-4 mb-3 text-paper"
      >
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-paper/55 mb-1">
          Net for the year
        </p>
        <p
          className={`font-numeric font-bold text-[44px] leading-none tracking-[-0.04em] mb-4 ${
            summary.netCents >= 0 ? 'text-lime' : 'text-coral'
          }`}
        >
          {summary.netCents >= 0 ? '+' : '−'}
          {formatAUD(Math.abs(summary.netCents))}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper/55 mb-1">
              Total in
            </p>
            <p className="font-numeric font-bold text-[16px] tracking-tight text-paper numeric">
              {formatAUD(summary.totalInCents)}
            </p>
          </div>
          <div>
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper/55 mb-1">
              Total out
            </p>
            <p className="font-numeric font-bold text-[16px] tracking-tight text-paper numeric">
              {formatAUD(summary.totalOutCents)}
            </p>
          </div>
          <div>
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper/55 mb-1">
              Card spend
            </p>
            <p className="font-numeric font-bold text-[16px] tracking-tight text-lime numeric">
              {formatAUD(summary.tapSpendCents)}
            </p>
          </div>
          <div>
            <p className="font-mono font-semibold text-[9px] uppercase tracking-[0.16em] text-paper/55 mb-1">
              Transactions
            </p>
            <p className="font-numeric font-bold text-[16px] tracking-tight text-paper numeric">
              {summary.count}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Tax-time tip */}
      <div className="bg-lime-soft border border-lime-deep rounded-[14px] px-3.5 py-2.5 mb-5 flex items-start gap-2">
        <Receipt size={14} strokeWidth={2.4} className="text-ink mt-[2px] shrink-0" />
        <p className="font-body text-[12px] leading-[1.45] text-ink flex-1">
          Some of this may be assessable. Talk to your accountant — Sorted isn&apos;t one.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2 mb-2">
        <motion.button
          whileTap={{ scale: 0.985 }}
          onClick={handleDownloadCSV}
          disabled={summary.count === 0}
          className="w-full flex items-center gap-3 p-3.5 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[15px] tracking-tight text-ink active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={18} strokeWidth={2.6} className="text-ink" />
          <span className="flex-1 text-left">Download CSV</span>
          <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink/65">
            .csv
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.985 }}
          onClick={handleEmailMe}
          disabled={summary.count === 0}
          className="w-full flex items-center gap-3 p-3.5 rounded-[14px] bg-paper-elevated border-[1.5px] border-line font-display font-bold text-[15px] tracking-tight text-ink active:translate-y-[1px] transition-transform disabled:opacity-60"
        >
          <Mail size={18} strokeWidth={2.4} className="text-ink" />
          <span className="flex-1 text-left">
            {emailSent ? 'Sent — check your inbox' : 'Email me a copy'}
          </span>
          <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            PDF + CSV
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.985 }}
          onClick={handleDownloadCSV}
          disabled={summary.count === 0}
          className="w-full flex items-center gap-3 p-3.5 rounded-[14px] bg-paper-elevated border-[1.5px] border-line font-display font-bold text-[15px] tracking-tight text-ink active:translate-y-[1px] transition-transform disabled:opacity-60"
        >
          <FileText size={18} strokeWidth={2.4} className="text-ink" />
          <span className="flex-1 text-left">Send to my accountant</span>
          <span className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            ATO-ready
          </span>
        </motion.button>
      </div>

      {summary.count === 0 && (
        <p className="text-center font-body text-[12px] text-ink-muted mt-2">
          No transactions in {selected.label} yet.
        </p>
      )}

      <div className="flex-1" />

      <p className="text-center font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-faint mt-4">
        Reports include sends, receives, top-ups, cash-outs, card taps
      </p>
    </Screen>
  )
}
