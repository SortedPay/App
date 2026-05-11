import { ChevronLeft, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Props = {
  /** Title text shown centered (rendered as mono eyebrow by default — Figma style) */
  title?: string
  /** Show back button (default: true) */
  back?: boolean
  /** Use X instead of chevron (modal-style) */
  closeMode?: boolean
  /** Right-side action */
  right?: React.ReactNode
  /** Override the back action */
  onBack?: () => void
  /** Render title as bold display heading instead of mono eyebrow */
  titleStyle?: 'mono' | 'display'
}

export default function Header({
  title,
  back = true,
  closeMode = false,
  right,
  onBack,
  titleStyle = 'mono',
}: Props) {
  const navigate = useNavigate()
  const Icon = closeMode ? X : ChevronLeft

  return (
    <header className="flex items-center justify-between pt-4 pb-3 app-chrome">
      <div className="w-10 flex">
        {back && (
          <button
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="w-10 h-10 rounded-full bg-paper-elevated border border-line flex items-center justify-center active:scale-[0.95] transition-transform"
            aria-label="Back"
          >
            <Icon size={18} strokeWidth={2.5} className="text-ink" />
          </button>
        )}
      </div>
      {title &&
        (titleStyle === 'mono' ? (
          <h1 className="font-mono font-semibold text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            {title}
          </h1>
        ) : (
          <h1 className="font-display font-bold text-[16px] tracking-tight">{title}</h1>
        ))}
      <div className="w-10 flex justify-end">{right}</div>
    </header>
  )
}
