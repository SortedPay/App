import { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Home, Send, Sparkles, User } from 'lucide-react'
import OfflineBanner from './OfflineBanner'

type Props = {
  children: ReactNode
}

// Routes where the bottom tab bar is hidden (onboarding + flow modals)
const NO_TABS = ['/', '/welcome', '/signin', '/verify', '/claim', '/profile', '/verifying', '/ready']
const FLOW_PREFIXES = ['/send', '/sms', '/receive', '/topup', '/legal', '/referrals', '/request', '/split']
// /contacts is a tab destination (list view) but anything deeper is a flow
const CONTACTS_FLOW_PATHS = ['/contacts/new']

function shouldShowTabs(pathname: string): boolean {
  if (NO_TABS.includes(pathname)) return false
  for (const p of FLOW_PREFIXES) {
    if (pathname.startsWith(p)) return false
  }
  // Hide tabs on /contacts/new and /contacts/:handle (detail), but show on /contacts (list)
  if (pathname === '/contacts') return true
  if (CONTACTS_FLOW_PATHS.includes(pathname)) return false
  if (pathname.startsWith('/contacts/')) return false
  return true
}

export default function AppShell({ children }: Props) {
  const location = useLocation()
  const showTabs = shouldShowTabs(location.pathname)

  return (
    <div className="min-h-screen bg-paper">
      {/* Offline indicator — only renders when navigator.onLine is false */}
      <OfflineBanner />

      {/* Screen content — pad bottom only when tab bar is visible so flow screens fit edge-to-edge */}
      <main className={`min-h-screen ${showTabs ? 'pb-32' : ''}`}>{children}</main>

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
    { id: 'pay', label: 'Pay', icon: Send, path: '/pay' },
    { id: 'card', label: 'Card', icon: CreditCard, path: '/card' },
    { id: 'perks', label: 'Perks', icon: Sparkles, path: '/perks' },
    { id: 'profile', label: 'Profile', icon: User, path: '/me' },
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
              (tab.id === 'profile' && (path === '/me' || path.startsWith('/settings')))
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-colors ${
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
