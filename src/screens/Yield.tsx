import { Navigate } from 'react-router-dom'

/**
 * /yield retired in v0.5.0 — the pivot removed balance yield entirely
 * (legal: Sorted cannot offer yield in Australia at this stage).
 * This stub keeps the file present for drag-drop deploys and points any
 * stale imports or bookmarks at Perks instead.
 */
export default function Yield() {
  return <Navigate to="/perks" replace />
}
