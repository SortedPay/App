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
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="RECEIVE" />

      <div className="pt-2 pb-5">
        <h1 className="font-display font-bold text-[34px] leading-[1] tracking-tightest text-ink mb-2">
          Get paid.
        </h1>
        <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft">
          Share your @handle. Lands instantly.
        </p>
      </div>

      {/* Big lime @handle card */}
      <div className="bg-lime border-[2px] border-ink rounded-[24px] p-6 mb-3 text-center shadow-ink-md">
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
            <Copy size={13} strokeWidth={2.5} />
            Copy
          </button>
          <button className="bg-paper-elevated border border-ink text-ink font-display font-bold text-[13px] rounded-full px-5 py-2 flex items-center gap-1.5 active:translate-y-[1px] transition-transform">
            <Share2 size={13} strokeWidth={2.5} />
            Share
          </button>
        </div>
      </div>

      {/* QR code card — minimal pattern (placeholder until real QR generation) */}
      <div className="bg-paper-elevated border border-line rounded-[24px] p-5 flex flex-col items-center">
        <div className="aspect-square w-full max-w-[220px] bg-ink rounded-[12px] p-4 relative">
          <QRPlaceholder />
        </div>
        <p className="text-center text-[10px] text-ink-muted mt-3 font-mono font-semibold uppercase tracking-[0.18em]">
          Or scan to pay @{user.handle}
        </p>
      </div>
    </Screen>
  )
}

// Stylised mini "QR" — three corner finder squares + a few scattered dots.
// This is a deliberate visual placeholder, not a working QR. In v0.3 we wire real QR generation.
function QRPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* 3 finder squares: top-left, top-right, bottom-left */}
      {[
        [10, 10],
        [70, 10],
        [10, 70],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="20" height="20" fill="white" />
          <rect x={x + 5} y={y + 5} width="10" height="10" fill="#0E0E18" />
        </g>
      ))}
      {/* Sprinkle of small dots in the middle to suggest data */}
      {[
        [40, 40],
        [50, 38],
        [45, 50],
        [55, 50],
        [60, 45],
        [42, 60],
        [50, 60],
        [55, 65],
        [62, 60],
        [70, 50],
        [73, 60],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="4" height="4" fill="white" />
      ))}
    </svg>
  )
}
