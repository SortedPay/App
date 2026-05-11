// ─────────────────────────────────────────────────────────────
// imageStore.ts
//
// Minimal IndexedDB wrapper for storing profile pictures.
// Stores image Blobs keyed by user handle. Used by Avatar +
// ProfileSetup + SettingsProfile to persist uploads across reloads.
//
// In v0.3 this is replaced by uploading to S3 / a CDN and storing
// the URL in the user record. For v0.2 (no backend), local IDB is
// the cleanest path — survives reloads, fits 5MB images comfortably,
// and lets the avatar load instantly on app boot.
// ─────────────────────────────────────────────────────────────

const DB_NAME = 'sorted-images'
const STORE_NAME = 'avatars'
const DB_VERSION = 1

// Cache the open DB instance so we don't reopen on every call
let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

/**
 * Store an avatar blob keyed by user handle.
 * Overwrites any existing image for that handle.
 */
export async function saveAvatar(handle: string, blob: Blob): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blob, handle)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Retrieve the avatar blob for a handle. Returns null if not set.
 */
export async function getAvatar(handle: string): Promise<Blob | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(handle)
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Delete the avatar for a handle. No-op if not set.
 */
export async function deleteAvatar(handle: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(handle)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Resize + recompress an image File to fit within a max dimension,
 * returned as a JPEG Blob. We do this client-side before storing so
 * we never put a 4MB iPhone photo in IDB.
 *
 * @param file Source File from <input type="file">
 * @param maxDimension Longest edge of the output (default 512)
 * @param quality JPEG quality 0..1 (default 0.85)
 */
export async function resizeImage(
  file: File,
  maxDimension = 512,
  quality = 0.85
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    const longest = Math.max(bitmap.width, bitmap.height)
    const scale = longest > maxDimension ? maxDimension / longest : 1
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    ctx.drawImage(bitmap, 0, 0, w, h)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
        'image/jpeg',
        quality
      )
    })
  } finally {
    bitmap.close()
  }
}
