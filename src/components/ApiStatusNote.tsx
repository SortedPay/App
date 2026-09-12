import { useStore } from '../lib/store'

/** Shown on the sign-in screens when the API could not be reached, so a dead build says so instead of failing silently. */
export default function ApiStatusNote() {
  const session = useStore((s) => s.session)
  const boot = useStore((s) => s.boot)
  if (session.status !== 'unreachable') return null
  return (
    <div className="mb-3 bg-butter/40 border border-butter rounded-[12px] px-3.5 py-2.5">
      <p className="font-body text-[12px] leading-[1.4] text-ink">{session.error ?? "Can't reach Sorted right now."}</p>
      <button type="button" onClick={() => void boot()} className="mt-1 font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink underline">
        Try again
      </button>
    </div>
  )
}
