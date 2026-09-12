import { useEffect, useState } from 'react'
import { api } from './api/client'
import { normaliseHandle, rememberUsers, resolveUser, type User } from './model'
import { useStore } from './store'

function matchesLocally(u: User, q: string): boolean {
  return u.handle.toLowerCase().includes(q) || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q)
}

/**
 * People search for the Send / Request / New contact screens: local contacts
 * answer instantly, the API fills in everyone else after a short debounce.
 * Results never include the signed-in user.
 */
export function useUserSearch(query: string, opts: { debounceMs?: number; exclude?: string[] } = {}): { results: User[]; searching: boolean } {
  const contacts = useStore((s) => s.contacts)
  const me = useStore((s) => s.user.handle)
  const [remote, setRemote] = useState<{ q: string; users: User[] }>({ q: '', users: [] })
  const [searching, setSearching] = useState(false)
  const q = normaliseHandle(query)
  const debounceMs = opts.debounceMs ?? 250

  useEffect(() => {
    if (q.length < 2) {
      setSearching(false)
      return
    }
    let cancelled = false
    setSearching(true)
    const t = setTimeout(() => {
      api.users
        .search(q)
        .then((users) => {
          if (cancelled) return
          rememberUsers(users)
          setRemote({ q, users })
        })
        .catch(() => {
          // Local matches still show; the network can be flaky on the train.
        })
        .finally(() => {
          if (!cancelled) setSearching(false)
        })
    }, debounceMs)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q, debounceMs])

  if (!q) return { results: [], searching: false }
  const excluded = new Set([me, ...(opts.exclude ?? [])].map((h) => h.toLowerCase()))
  const seen = new Set<string>()
  const out: User[] = []
  const push = (u: User) => {
    const h = u.handle.toLowerCase()
    if (excluded.has(h) || seen.has(h)) return
    seen.add(h)
    out.push(u)
  }
  for (const c of contacts) if (matchesLocally(c, q)) push(c)
  if (remote.q === q) for (const u of remote.users) push(u)
  return { results: out.slice(0, 8), searching }
}

/**
 * Resolve a route param like /send/:handle to a user. Contacts and anything
 * the API has already shown us answer synchronously; a cold load (refresh,
 * shared link) asks `users.byHandle` once.
 */
export function useResolvedUser(handle: string | undefined): { user: User | undefined; loading: boolean; missing: boolean } {
  const contacts = useStore((s) => s.contacts)
  const local = handle ? resolveUser(handle, contacts) : undefined
  const [fetched, setFetched] = useState<{ handle: string; user: User | null } | null>(null)
  const h = handle ? normaliseHandle(handle) : ''

  useEffect(() => {
    if (!h || local) return
    let cancelled = false
    api.users
      .byHandle(h)
      .then((u) => {
        if (cancelled) return
        if (u) rememberUsers([u])
        setFetched({ handle: h, user: u })
      })
      .catch(() => {
        if (!cancelled) setFetched({ handle: h, user: null })
      })
    return () => {
      cancelled = true
    }
  }, [h, local])

  if (local) return { user: local, loading: false, missing: false }
  if (fetched && fetched.handle === h) return { user: fetched.user ?? undefined, loading: false, missing: !fetched.user }
  return { user: undefined, loading: !!h, missing: !h }
}
