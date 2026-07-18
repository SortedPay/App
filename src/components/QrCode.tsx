import { useMemo } from 'react'
import { makeQr } from '../lib/qr'

type Props = {
  /** What the code encodes — usually the profile link. */
  payload: string
  /** Module colour (the dots). Default paper for ink cards. */
  fg?: string
  /** Show the little lime "s." chip in the centre. Safe at M error correction. */
  brandChip?: boolean
  className?: string
}

/**
 * Crisp SVG QR — replaces the v0.2 placeholder. Real, scannable codes
 * generated on-device by the vendored MIT encoder in lib/qr.ts.
 * The centre chip covers ~4% of the symbol, well inside the ~15%
 * error-correction budget at level M, so scans stay reliable.
 */
export default function QrCode({ payload, fg = '#F6F2E9', brandChip = true, className = '' }: Props) {
  const { path, count } = useMemo(() => makeQr(payload), [payload])
  // 2-module quiet zone on every side keeps scanners happy on the ink card
  const q = 2
  const vb = count + q * 2
  const chip = count * 0.2 // chip side in modules (~4% of area)
  const chipXY = q + (count - chip) / 2

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} className={className} role="img" aria-label={`QR code for ${payload}`}>
      <g transform={`translate(${q} ${q})`}>
        <path d={path} fill={fg} />
      </g>
      {brandChip && (
        <g>
          <rect
            x={chipXY}
            y={chipXY}
            width={chip}
            height={chip}
            rx={chip * 0.24}
            fill="#C8F154"
            stroke="#0E0E18"
            strokeWidth={0.6}
          />
          <text
            x={chipXY + chip / 2}
            y={chipXY + chip / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Bricolage Grotesque", sans-serif'
            fontWeight={700}
            fontSize={chip * 0.62}
            fill="#0E0E18"
          >
            s.
          </text>
        </g>
      )}
    </svg>
  )
}
