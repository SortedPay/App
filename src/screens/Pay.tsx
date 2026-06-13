import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  BookUser,
  HandCoins,
  MessageSquare,
  Plus,
  Users,
} from 'lucide-react'
import Screen from '../components/Screen'
import { cascade, cardRise, popIn } from '../lib/motion'

/**
 * Pay — the hub tab. Every way money moves, one screen.
 * Send is the hero (it's the product); everything else is one tap away.
 */
export default function Pay() {
  const navigate = useNavigate()

  return (
    <Screen transition="fade" className="pt-2 pb-4">
      <header className="pt-3 pb-5">
        <p className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-0.5">
          Money, moving
        </p>
        <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest">Pay</h1>
      </header>

      <motion.div variants={cascade} initial="hidden" animate="show">
        {/* Send — the hero action */}
        <motion.button
          variants={popIn}
          onClick={() => navigate('/send')}
          className="w-full bg-lime border-[1.5px] border-ink rounded-[20px] px-5 py-5 mb-3 flex items-center gap-4 shadow-ink-sm active:translate-y-[1px] active:shadow-none transition-all text-left"
        >
          <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
            <ArrowUp size={22} strokeWidth={2.8} className="text-lime" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-[19px] tracking-tight text-ink leading-[1.1]">
              Send to a mate
            </p>
            <p className="font-body text-[13px] text-ink/65 mt-1 leading-[1.3]">
              Any @handle · free · lands in seconds
            </p>
          </div>
        </motion.button>

        {/* Secondary grid */}
        <motion.div variants={cardRise} className="grid grid-cols-2 gap-2 mb-3">
          <HubCard
            icon={<HandCoins size={18} strokeWidth={2.4} className="text-ink" />}
            bubble="bg-coral"
            title="Request"
            sub="Ask a mate to square up"
            onClick={() => navigate('/request')}
          />
          <HubCard
            icon={<Users size={18} strokeWidth={2.4} className="text-ink" />}
            bubble="bg-sky"
            title="Split"
            sub="Dinner, rent, the Uber"
            onClick={() => navigate('/split')}
          />
          <HubCard
            icon={<ArrowDown size={18} strokeWidth={2.4} className="text-ink" />}
            bubble="bg-butter"
            title="Receive"
            sub="Share your @handle"
            onClick={() => navigate('/receive')}
          />
          <HubCard
            icon={<Plus size={18} strokeWidth={2.4} className="text-paper" />}
            bubble="bg-plum"
            title="Top up"
            sub="PayID · in seconds"
            onClick={() => navigate('/topup')}
          />
        </motion.div>

        {/* Full-width rows */}
        <motion.div variants={cardRise} className="space-y-2">
          <WideRow
            icon={<MessageSquare size={16} strokeWidth={2.4} className="text-ink" />}
            title="Pay someone not on Sorted"
            sub="Send by SMS — they claim it when they join"
            onClick={() => navigate('/sms')}
          />
          <WideRow
            icon={<BookUser size={16} strokeWidth={2.4} className="text-ink" />}
            title="Contacts"
            sub="Your people, pinned and recent"
            onClick={() => navigate('/contacts')}
          />
        </motion.div>
      </motion.div>
    </Screen>
  )
}

function HubCard({
  icon,
  bubble,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode
  bubble: string
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-paper-elevated border border-line rounded-[16px] p-4 text-left active:bg-line-soft transition-colors"
    >
      <div className={`w-9 h-9 rounded-full ${bubble} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="font-display font-bold text-[15px] tracking-tight text-ink leading-[1.15]">
        {title}
      </p>
      <p className="font-body text-[11.5px] text-ink-muted mt-1 leading-[1.3]">{sub}</p>
    </button>
  )
}

function WideRow({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-paper-elevated border border-line rounded-[14px] px-4 py-3 flex items-center gap-3 active:bg-line-soft transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-full bg-line-soft border border-line flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-[14px] tracking-tight text-ink leading-[1.2]">
          {title}
        </p>
        <p className="font-body text-[12px] text-ink-muted mt-0.5 leading-[1.3] truncate">{sub}</p>
      </div>
    </button>
  )
}
