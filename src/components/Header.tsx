import { ChevronLeft, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Props = {
  title?: string
  // Show back button (default: true)
  back?: boolean
  // Use X instead of chevron (modal-style)
  closeMode?: boolean
  // Right-side action
  right?: React.ReactNode
  // Override the back action
  onBack?: () => void
}

export default function Header({ title, back = true, closeMode = false, right, onBack }: Props) {
  const navigate = useNavigate()
  const Icon = closeMode ? X : ChevronLeft

  return (
    <header className="flex items-center justify-between pt-4 pb-2 app-chrome">
      <div className="w-10">
        {back && (
          <button
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-line-soft active:bg-line transition-colors"
            aria-label="Back"
          >
            <Icon size={22} strokeWidth={2.5} />
          </button>
        )}
      </div>
      {title && (
        <h1 className="font-display font-bold text-[15px] tracking-tight">{title}</h1>
      )}
      <div className="w-10 flex justify-end">{right}</div>
    </header>
  )
}
