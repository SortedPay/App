import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useStore } from './lib/store'

// Onboarding screens
import Welcome from './screens/Welcome'
import VerifyCode from './screens/VerifyCode'
import ClaimHandle from './screens/ClaimHandle'
import ProfileSetup from './screens/ProfileSetup'
import WalletReady from './screens/WalletReady'

// App screens
import Home from './screens/Home'
import Activity from './screens/Activity'
import Settings from './screens/Settings'
import SendWho from './screens/SendWho'
import SendAmount from './screens/SendAmount'
import SendConfirm from './screens/SendConfirm'
import SendDone from './screens/SendDone'
import Receive from './screens/Receive'
import TopUpAmount from './screens/TopUpAmount'
import TopUpPayID from './screens/TopUpPayID'
import TxDetail from './screens/TxDetail'

import AppShell from './components/AppShell'

export default function App() {
  const location = useLocation()
  const tickYield = useStore((s) => s._tickYield)

  // Tick yield every 60s so demos feel alive when paused on home
  useEffect(() => {
    const id = setInterval(() => tickYield(), 60_000)
    return () => clearInterval(id)
  }, [tickYield])

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Onboarding chain */}
          <Route path="/" element={<Welcome />} />
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/claim" element={<ClaimHandle />} />
          <Route path="/profile" element={<ProfileSetup />} />
          <Route path="/ready" element={<WalletReady />} />

          {/* Main app */}
          <Route path="/home" element={<Home />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/activity/:id" element={<TxDetail />} />
          <Route path="/settings" element={<Settings />} />

          {/* Send flow */}
          <Route path="/send" element={<SendWho />} />
          <Route path="/send/:handle" element={<SendAmount />} />
          <Route path="/send/:handle/confirm" element={<SendConfirm />} />
          <Route path="/send/:handle/done" element={<SendDone />} />

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
