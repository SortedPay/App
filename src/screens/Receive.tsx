import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Share2 } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { useStore } from '../lib/store'
import { cascade, popIn, softRise, cardRise } from '../lib/motion'
import QrCode from '../components/QrCode'

type ShareState = 'idle' | 'shared' | 'copied'

export default function Receive() {
  const user = useStore((s) => s.user)
  const [copied, setCopied] = useState(false)
  const [shareState, setShareState] = useState<ShareState>('idle')
  const profileUrl = `https://app.paymentsorted.com/@${user.handle}`

  function copyHandle() {
    navigator.clipboard?.writeText(`@${user.handle}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function shareHandle() {
    let next: ShareState = 'copied'
    if (navigator.share) {
      try {
        await navigator.share({ title: `Pay @${user.handle} on Sorted`, url: profileUrl })
        next = 'shared'
      } catch {
        // user dismissed the sheet — nothing to report
        return
      }
    } else {
      navigator.clipboard?.writeText(profileUrl)
    }
    setShareState(next)
    setTimeout(() => setShareState('idle'), 1500)
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="RECEIVE" />

      <motion.div variants={cascade} initial="hidden" animate="show">
        <motion.div variants={softRise} className="pt-2 pb-5">
          <h1 className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-2">
            Get paid.
          </h1>
          <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft">
            Share your @handle. Lands instantly.
          </p>
        </motion.div>

        {/* Big lime @handle card — pops in, this is the moment */}
        <motion.div
          variants={popIn}
          className="bg-lime border-[2px] border-ink rounded-[24px] p-6 mb-3 text-center shadow-ink-md"
        >
          <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink/65 mb-2">
            Your handle
          </p>
          <p className="font-display font-bold text-[44px] leading-none tracking-tightest text-ink mb-5">
            @{user.handle}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={copyHandle}
              className="bg-paper-elevated border border-ink text-ink font-display font-bold text-[13px] rounded-full px-5 py-2 flex items-center gap-1.5 active:translate-y-[1px] transition-transform"
            >
              {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2.5} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={shareHandle}
              className="bg-paper-elevated border border-ink text-ink font-display font-bold text-[13px] rounded-full px-5 py-2 flex items-center gap-1.5 active:translate-y-[1px] transition-transform"
            >
              {shareState === 'idle' ? (
                <Share2 size={13} strokeWidth={2.5} />
              ) : (
                <Check size={13} strokeWidth={2.5} />
              )}
              {shareState === 'shared' ? 'Shared' : shareState === 'copied' ? 'Copied' : 'Share'}
            </button>
          </div>
        </motion.div>

        {/* QR code card — scannable link to the profile */}
        <motion.div
          variants={cardRise}
          className="bg-paper-elevated border border-line rounded-[24px] p-5 flex flex-col items-center"
        >
          <div className="aspect-square w-full max-w-[220px] bg-ink rounded-[12px] p-4 relative">
            <QrCode payload={profileUrl} className="w-full h-full" />
          </div>
          <p className="text-center text-[10px] text-ink-muted mt-3 font-mono font-semibold uppercase tracking-[0.18em]">
            Or scan to pay @{user.handle}
          </p>
        </motion.div>
      </motion.div>
    </Screen>
  )
}
