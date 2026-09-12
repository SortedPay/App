/**
 * Privy sign-in and embedded-wallet signing. Loaded lazily by `main.tsx`
 * only when VITE_PRIVY_APP_ID is set, so dev builds never ship the SDK.
 *
 * Nothing else in the app imports Privy: this file registers an imperative
 * bridge (`registerAuthBridge`) that `lib/auth.ts` calls for tokens, OTP
 * login and transaction signing.
 */
import { useEffect, useRef, type ReactNode } from 'react'
import { PrivyProvider, useLoginWithSms, usePrivy } from '@privy-io/react-auth'
import { useSignTransaction, useWallets } from '@privy-io/react-auth/solana'
import { registerAuthBridge } from './auth'

type Props = { appId: string; children: ReactNode }

export default function PrivyRoot({ appId, children }: Props) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['sms'],
        embeddedWallets: {
          solana: { createOnLogin: 'users-without-wallets' },
        },
        appearance: { theme: 'light', accentColor: '#C8F154' },
      }}
    >
      <Bridge />
      {children}
    </PrivyProvider>
  )
}

/** Keeps the latest hook values in refs and hands the auth layer stable functions. */
function Bridge() {
  const { ready, authenticated, getAccessToken, logout } = usePrivy()
  const { sendCode, loginWithCode } = useLoginWithSms()
  const { wallets, ready: walletsReady } = useWallets()
  const { signTransaction } = useSignTransaction()

  const latest = useRef({ ready, authenticated, getAccessToken, logout, sendCode, loginWithCode, wallets, walletsReady, signTransaction })
  latest.current = { ready, authenticated, getAccessToken, logout, sendCode, loginWithCode, wallets, walletsReady, signTransaction }

  const readyResolve = useRef<(() => void) | null>(null)
  const readyPromise = useRef<Promise<void>>(new Promise((resolve) => {
    readyResolve.current = resolve
  }))

  useEffect(() => {
    if (ready) readyResolve.current?.()
  }, [ready])

  useEffect(() => {
    registerAuthBridge({
      ready: readyPromise.current,
      isAuthenticated: () => latest.current.authenticated,
      getAccessToken: () => latest.current.getAccessToken(),
      sendCode: (phoneNumber) => latest.current.sendCode({ phoneNumber }),
      loginWithCode: (code) => latest.current.loginWithCode({ code }),
      logout: () => latest.current.logout(),
      signTransaction: async (transaction) => {
        const wallet = await embeddedWallet()
        const { signedTransaction } = await latest.current.signTransaction({ transaction, wallet })
        return signedTransaction
      },
    })
  }, [])

  /** The Privy embedded wallet can take a moment after login; wait for it rather than failing the first send. */
  async function embeddedWallet() {
    for (let attempt = 0; attempt < 40; attempt++) {
      const { wallets, walletsReady } = latest.current
      const embedded = wallets.find((w) => w.standardWallet.name === 'Privy') ?? wallets[0]
      if (walletsReady && embedded) return embedded
      await new Promise((r) => setTimeout(r, 250))
    }
    throw new Error("Your wallet isn't ready yet. Try again in a moment.")
  }

  return null
}
