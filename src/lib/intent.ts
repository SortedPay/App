/**
 * In-flight flow intent (pending send / request / SMS / top-up) lives in
 * sessionStorage between screens. Read it once on mount with
 * `useState(() => readIntent(...))`: screens clear it on success, and a
 * later store update must not re-render the exiting screen with an empty
 * intent and trip its cold-load redirect.
 */
export function readIntent<T extends object>(key: string): T {
  try {
    return JSON.parse(sessionStorage.getItem(key) || '{}') as T
  } catch {
    return {} as T
  }
}
