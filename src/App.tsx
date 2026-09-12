import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useStore } from './lib/store'
import { getAvatar } from './lib/imageStore'
import { stashReferralCode } from './lib/auth'
import SessionGate from './components/SessionGate'

// Onboarding screens
import Splash from './screens/Splash'
import Welcome from './screens/Welcome'
import SignIn from './screens/SignIn'
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

// Request flow
import RequestWho from './screens/RequestWho'
import RequestAmount from './screens/RequestAmount'
import RequestConfirm from './screens/RequestConfirm'
import RequestSent from './screens/RequestSent'

// Split flow
import SplitPeople from './screens/SplitPeople'
import SplitAmount from './screens/SplitAmount'
import SplitSent from './screens/SplitSent'
import Receive from './screens/Receive'
import TopUpAmount from './screens/TopUpAmount'
import TopUpPayID from './screens/TopUpPayID'
import TxDetail from './screens/TxDetail'
import Pay from './screens/Pay'
import CardScreen from './screens/Card'
import Perks from './screens/Perks'
import SettingsProfile from './screens/SettingsProfile'
import SettingsVerification from './screens/SettingsVerification'
import SettingsVerifyUpgrade from './screens/SettingsVerifyUpgrade'
import SettingsNotifications from './screens/SettingsNotifications'
import SettingsSecurity from './screens/SettingsSecurity'
import Tax from './screens/Tax'
import Me from './screens/Me'

// Legal
import Terms from './screens/Terms'
import Privacy from './screens/Privacy'

// Contacts
import NewContact from './screens/NewContact'
import Contacts from './screens/Contacts'
import ContactDetail from './screens/ContactDetail'

// Referrals
import Referrals from './screens/Referrals'

// SMS claim links
import ClaimSend from './screens/ClaimSend'

import AppShell from './components/AppShell'

export default function App() {
  const location = useLocation()
  const userHandle = useStore((s) => s.user.handle)
  const setAvatarUrl = useStore((s) => s.setAvatarUrl)
  const boot = useStore((s) => s.boot)

  // Start: remember a referral from the share link, then ask the API who we are.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref) stashReferralCode(ref)
    void boot()
  }, [boot])

  // Hydrate the user's avatar from IndexedDB whenever we know who is signed in.
  // The handle is the IDB key.
  useEffect(() => {
    if (!userHandle) return
    let cancelled = false
    getAvatar(userHandle)
      .then((blob) => {
        if (cancelled || !blob) return
        const url = URL.createObjectURL(blob)
        setAvatarUrl(url)
      })
      .catch(() => {
        // Silent — no avatar saved yet is the normal case for new testers
      })
    return () => {
      cancelled = true
    }
  }, [userHandle, setAvatarUrl])

  // Screens that need an account sit behind the gate; onboarding, legal and claim links do not.
  const gated = (el: ReactNode) => <SessionGate>{el}</SessionGate>

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Splash intro → auto-advances to /welcome */}
          <Route path="/" element={<Splash />} />

          {/* Onboarding chain */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/claim" element={gated(<ClaimHandle />)} />
          <Route path="/profile" element={gated(<ProfileSetup />)} />
          <Route path="/verifying" element={gated(<VerifyIdentity />)} />
          <Route path="/ready" element={gated(<WalletReady />)} />

          {/* Main app */}
          <Route path="/home" element={gated(<Home />)} />
          <Route path="/activity" element={gated(<Activity />)} />
          <Route path="/activity/:id" element={gated(<TxDetail />)} />
          <Route path="/pay" element={gated(<Pay />)} />
          <Route path="/card" element={gated(<CardScreen />)} />
          <Route path="/perks" element={gated(<Perks />)} />
          <Route path="/me" element={gated(<Me />)} />
          {/* /yield retired in the pivot — old links land on Perks */}
          <Route path="/yield" element={<Navigate to="/perks" replace />} />
          <Route path="/settings" element={gated(<Settings />)} />
          <Route path="/settings/profile" element={gated(<SettingsProfile />)} />
          <Route path="/settings/verification" element={gated(<SettingsVerification />)} />
          <Route path="/settings/verification/upgrade" element={gated(<SettingsVerifyUpgrade />)} />
          <Route path="/settings/notifications" element={gated(<SettingsNotifications />)} />
          <Route path="/settings/security" element={gated(<SettingsSecurity />)} />
          <Route path="/settings/tax" element={gated(<Tax />)} />

          {/* Send flow */}
          <Route path="/send" element={gated(<SendWho />)} />
          <Route path="/send/:handle" element={gated(<SendAmount />)} />
          <Route path="/send/:handle/confirm" element={gated(<SendConfirm />)} />
          <Route path="/send/:handle/done" element={gated(<SendDone />)} />

          {/* Request flow */}
          <Route path="/request" element={gated(<RequestWho />)} />
          <Route path="/request/:handle" element={gated(<RequestAmount />)} />
          <Route path="/request/:handle/confirm" element={gated(<RequestConfirm />)} />
          <Route path="/request/:handle/sent" element={gated(<RequestSent />)} />

          {/* Split flow */}
          <Route path="/split" element={gated(<SplitPeople />)} />
          <Route path="/split/amount" element={gated(<SplitAmount />)} />
          <Route path="/split/sent" element={gated(<SplitSent />)} />

          {/* SMS send flow — separate prefix to avoid /send/:handle collision */}
          <Route path="/sms" element={gated(<SendSmsNumber />)} />
          <Route path="/sms/amount" element={gated(<SendSmsAmount />)} />
          <Route path="/sms/confirm" element={gated(<SendSmsConfirm />)} />
          <Route path="/sms/pending" element={gated(<SendSmsPending />)} />
          <Route path="/sms/done" element={gated(<SendSmsAllSorted />)} />

          {/* Receive */}
          <Route path="/receive" element={gated(<Receive />)} />

          {/* Top up */}
          <Route path="/topup" element={gated(<TopUpAmount />)} />
          <Route path="/topup/payid" element={gated(<TopUpPayID />)} />

          {/* Legal */}
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/legal/privacy" element={<Privacy />} />

          {/* Contacts */}
          <Route path="/contacts" element={gated(<Contacts />)} />
          <Route path="/contacts/new" element={gated(<NewContact />)} />
          <Route path="/contacts/:handle" element={gated(<ContactDetail />)} />

          {/* Referrals */}
          <Route path="/referrals" element={gated(<Referrals />)} />

          {/* SMS claim link: app.paymentsorted.com/c/<code> */}
          <Route path="/c/:code" element={<ClaimSend />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}
