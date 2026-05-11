import { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Clock, Settings as SettingsIcon } from 'lucide-react'

type Props = {
  children: ReactNode
}

// Routes where the bottom tab bar is hidden (onboarding + flow modals)
const NO_TABS = ['/', '/welcome', '/verify', '/claim', '/profile', '/verifying', '/ready']
const FLOW_PREFIXES = ['/send', '/sms', '/receive', '/topup']

function shouldShowTabs(pathname: string): boolean {
  if (NO_TABS.includes(pathname)) return false
  for (const p of FLOW_PREFIXES) {
    if (pathname.startsWith(p)) return false
  }
  return true
}

export default function AppShell({ children }: Props) {
  const location = useLocation()
  const showTabs = shouldShowTabs(location.pathname)

  return (
    <div className="min-h-screen bg-paper">
      {/* The actual screen content */}
      <main className="min-h-screen pb-20">{children}</main>

      {/* Bottom tab bar — fixed */}
      {showTabs && <BottomTabs />}
    </div>
  )
}

function BottomTabs() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'activity', label: 'Activity', icon: Clock, path: '/activity' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
  ] as const

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 app-chrome"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Tile sits visually on top of a dark bleed band.
          Bleeds left + right + down so phone frame crops edges cleanly. */}
      <div className="bg-ink rounded-t-3xl pt-3 pb-3 shadow-ink-md">
        <div className="mx-auto max-w-md px-6 flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active =
              path === tab.path ||
              (tab.id === 'activity' && path.startsWith('/activity')) ||
              (tab.id === 'settings' && path.startsWith('/settings'))
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-colors ${
                  active ? 'bg-lime text-ink' : 'text-paper'
                }`}
                aria-label={tab.label}
              >
                <Icon size={20} strokeWidth={2.5} />
                <span className="text-[10px] font-mono font-semibold tracking-widest uppercase">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      {/* Dark bleed band — fills to viewport bottom so phone frame crops cleanly */}
      <div className="bg-ink h-12" />
    </nav>
  )
}
