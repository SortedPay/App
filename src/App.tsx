import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useStore } from './lib/store'

// Onboarding screens
import Splash from './screens/Splash'
import Welcome from './screens/Welcome'
import VerifyCode from './screens/VerifyCode'
import ClaimHandle from './screens/ClaimHandle'
import ProfileSetup from './screens/ProfileSetup'
import VerifyIdentity from './screens/VerifyIdentity'
import WalletReady from './screens/WalletReady'

// App screens
import Home from './screens/Home'
import Activity from './screens/Activity'
import Settings from './screens/Settings'
import SendWho from './screens/SendWho'
import SendAmount from './screens/SendAmount'
import SendConfirm from './screens/SendConfirm'
import SendDone from './screens/SendDone'
import SendSmsNumber from './screens/SendSmsNumber'
import SendSmsAmount from './screens/SendSmsAmount'
import SendSmsConfirm from './screens/SendSmsConfirm'
import SendSmsPending from './screens/SendSmsPending'
import SendSmsAllSorted from './screens/SendSmsAllSorted'
import Receive from './screens/Receive'
import TopUpAmount from './screens/TopUpAmount'
import TopUpPayID from './screens/TopUpPayID'
import TxDetail from './screens/TxDetail'
import Yield from './screens/Yield'
import SettingsProfile from './screens/SettingsProfile'
import SettingsVerification from './screens/SettingsVerification'
import SettingsNotifications from './screens/SettingsNotifications'

import AppShell from './components/AppShell'

export default function App() {
  const location = useLocation()
  const tickYield = useStore((s) => s._tickYield)

  // Tick yield every 5s so demos feel alive — visible counter increments.
  // In production this would be 60s or driven by actual onchain yield events.
  useEffect(() => {
    const id = setInterval(() => tickYield(), 5_000)
    return () => clearInterval(id)
  }, [tickYield])

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Splash intro → auto-advances to /welcome */}
          <Route path="/" element={<Splash />} />

          {/* Onboarding chain */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/claim" element={<ClaimHandle />} />
          <Route path="/profile" element={<ProfileSetup />} />
          <Route path="/verifying" element={<VerifyIdentity />} />
          <Route path="/ready" element={<WalletReady />} />

          {/* Main app */}
          <Route path="/home" element={<Home />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/activity/:id" element={<TxDetail />} />
          <Route path="/yield" element={<Yield />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<SettingsProfile />} />
          <Route path="/settings/verification" element={<SettingsVerification />} />
          <Route path="/settings/notifications" element={<SettingsNotifications />} />

          {/* Send flow */}
          <Route path="/send" element={<SendWho />} />
          <Route path="/send/:handle" element={<SendAmount />} />
          <Route path="/send/:handle/confirm" element={<SendConfirm />} />
          <Route path="/send/:handle/done" element={<SendDone />} />

          {/* SMS send flow — separate prefix to avoid /send/:handle collision */}
          <Route path="/sms" element={<SendSmsNumber />} />
          <Route path="/sms/amount" element={<SendSmsAmount />} />
          <Route path="/sms/confirm" element={<SendSmsConfirm />} />
          <Route path="/sms/pending" element={<SendSmsPending />} />
          <Route path="/sms/done" element={<SendSmsAllSorted />} />

          {/* Receive */}
          <Route path="/receive" element={<Receive />} />

          {/* Top up */}
          <Route path="/topup" element={<TopUpAmount />} />
          <Route path="/topup/payid" element={<TopUpPayID />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}
