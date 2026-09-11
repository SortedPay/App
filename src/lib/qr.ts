import qrcode from 'qrcode-generator'

export type QrData = {
  /** SVG path drawing every dark module as a unit square (viewBox 0 0 count count). */
  path: string
  /** Modules per side, excluding the quiet zone (the caller adds that). */
  count: number
}

/**
 * Encode a payload as an SVG path + module count so screens can render
 * crisp, brand-coloured QR codes at any size.
 */
export function makeQr(payload: string): QrData {
  // typeNumber 0 = auto-size; 'M' error correction survives the centre chip + small print
  const qr = qrcode(0, 'M')
  qr.addData(payload)
  qr.make()
  const count = qr.getModuleCount()
  let path = ''
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`
    }
  }
  return { path, count }
}
