import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PRIVY_APP_ID } from './lib/auth'
import './styles/global.css'

// Privy (SMS sign-in + embedded Solana wallet) only ships when an app id is
// configured; dev builds talk to the API's dev sign-in and never load it.
const PrivyRoot = PRIVY_APP_ID ? lazy(() => import('./lib/privy')) : null

const tree = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {PrivyRoot && PRIVY_APP_ID ? (
      <Suspense fallback={null}>
        <PrivyRoot appId={PRIVY_APP_ID}>{tree}</PrivyRoot>
      </Suspense>
    ) : (
      tree
    )}
  </StrictMode>,
)
