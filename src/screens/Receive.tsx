import { Copy, Share2 } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { useStore } from '../lib/store'

export default function Receive() {
  const user = useStore((s) => s.user)

  function copyHandle() {
    navigator.clipboard?.writeText(`@${user.handle}`)
  }

  return (
    <Screen transition="slide" className="pt-2">
      <Header title="Receive" />

      <div className="pt-4 pb-6 text-center">
        <h1 className="font-display font-bold text-[32px] leading-none tracking-tightest mb-2">
          Get paid.
        </h1>
        <p className="text-ink-soft text-[15px] max-w-[28ch] mx-auto">
          Share your handle or scan the code.
        </p>
      </div>

      {/* Big handle card */}
      <div className="bg-lime border-[2.5px] border-ink rounded-[28px] p-6 mb-4 text-center shadow-ink-md">
        <p className="label-mono mb-2">Your handle</p>
        <p className="font-display font-bold text-[44px] leading-none tracking-tightest mb-5">
          @{user.handle}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={copyHandle}
            className="bg-ink text-lime font-display font-bold text-[14px] rounded-2xl px-5 py-2.5 flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Copy size={14} strokeWidth={2.5} />
            Copy
          </button>
          <button className="bg-paper text-ink font-display font-bold text-[14px] rounded-2xl px-5 py-2.5 flex items-center gap-2 border-2 border-ink active:scale-95 transition-transform">
            <Share2 size={14} strokeWidth={2.5} />
            Share
          </button>
        </div>
      </div>

      {/* QR code placeholder */}
      <div className="bg-paper-elevated border-[2.5px] border-ink rounded-[28px] p-6 shadow-ink-sm">
        <div className="aspect-square w-full max-w-[280px] mx-auto bg-paper rounded-2xl border-2 border-ink p-4 grid place-items-center">
          <QRPlaceholder handle={user.handle} />
        </div>
        <p className="text-center text-[12px] text-ink-muted mt-4 font-mono uppercase tracking-widest">
          Scan with Sorted
        </p>
      </div>
    </Screen>
  )
}

// Pseudo-QR — just a visual stand-in for the demo
function QRPlaceholder({ handle }: { handle: string }) {
  // Simple deterministic 21x21 grid
  const seed = handle.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const cells: boolean[] = []
  for (let i = 0; i < 21 * 21; i++) {
    cells.push((Math.sin(seed + i * 1.3) + Math.cos(seed * 0.7 + i * 0.9)) > 0.1)
  }
  return (
    <div className="grid grid-cols-[repeat(21,1fr)] gap-[1px] w-full h-full">
      {cells.map((on, i) => {
        // Force "finder" patterns at corners
        const r = Math.floor(i / 21)
        const c = i % 21
        const inFinder =
          (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)
        const finderOn = inFinder && ((r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r === 0 && c === 6) || (r === 6 && c === 0) || (r === 0 && c === 14) || (r === 6 && c === 20) ||
          (r === 14 && c === 0) || (r === 20 && c === 6)) || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
        const final = inFinder ? finderOn : on
        return <div key={i} className={final ? 'bg-ink' : 'bg-transparent'} />
      })}
    </div>
  )
}
