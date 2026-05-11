import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { useStore } from '../lib/store'
import { saveAvatar, resizeImage } from '../lib/imageStore'

const COLORS = [
  { id: 'lime', bg: 'bg-lime' },
  { id: 'coral', bg: 'bg-coral' },
  { id: 'sky', bg: 'bg-sky' },
  { id: 'butter', bg: 'bg-butter' },
  { id: 'plum', bg: 'bg-plum' },
] as const

type ColorId = (typeof COLORS)[number]['id']

export default function ProfileSetup() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const updateUser = useStore((s) => s.updateUser)
  const avatarUrl = useStore((s) => s.avatarUrl)
  const setAvatarUrl = useStore((s) => s.setAvatarUrl)

  const [firstName, setFirstName] = useState('Hannah')
  const [lastName, setLastName] = useState('Reid')
  const [color, setColor] = useState<ColorId>('lime')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase()
  const previewUser = {
    initials: initials || '·',
    color,
    firstName: firstName || 'Friend',
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    try {
      const blob = await resizeImage(file, 512, 0.85)
      await saveAvatar(user.handle, blob)
      const url = URL.createObjectURL(blob)
      setAvatarUrl(url)
    } catch (err) {
      console.error('Avatar upload failed', err)
      setUploadError("Couldn't load that image.")
    } finally {
      if (e.target) e.target.value = ''
    }
  }

  function handleContinue() {
    // Persist name + colour into the store so the rest of the app shows them
    updateUser({ firstName: firstName.trim(), lastName: lastName.trim(), color })
    navigate('/verifying')
  }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6">
      <Header title="YOUR DETAILS" />

      <div className="flex-1 flex flex-col pb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pt-4"
        >
          <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-tightest text-ink mb-2">
            What should we call you?
          </h1>
          <p className="font-body font-medium text-[14px] leading-[1.45] text-ink-soft max-w-[300px] mx-auto mb-6">
            Real name on the receipts. Pick a vibe — or upload a photo.
          </p>
        </motion.div>

        {/* Avatar preview with camera badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex justify-center mb-4"
        >
          <div className="relative">
            <Avatar user={previewUser} size="xl" imageUrl={avatarUrl} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-paper-elevated border-[2px] border-ink shadow-ink-sm flex items-center justify-center active:translate-y-[1px] active:shadow-none transition-all"
              aria-label="Upload profile picture"
            >
              <Camera size={15} strokeWidth={2.5} className="text-ink" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </motion.div>

        {uploadError && (
          <p className="text-center font-body text-[12px] text-coral mb-2">{uploadError}</p>
        )}

        {/* Colour swatches — only when no uploaded avatar */}
        {!avatarUrl && (
          <div className="flex justify-center gap-2.5 mb-10">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                className={`w-8 h-8 rounded-full ${c.bg} transition-all ${
                  color === c.id
                    ? 'border-[2.5px] border-ink scale-110'
                    : 'border-[1.5px] border-ink/40'
                }`}
                aria-label={`Colour ${c.id}`}
              />
            ))}
          </div>
        )}

        {avatarUrl && <div className="mb-8" />}

        {/* Name fields */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted block mb-2">
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[16px] text-ink py-[14px] px-[18px]"
              autoCapitalize="words"
            />
          </div>
          <div>
            <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.16em] text-ink-muted block mb-2">
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[16px] text-ink py-[14px] px-[18px]"
              autoCapitalize="words"
            />
          </div>
        </div>

        <button
          className="w-full py-4 rounded-[14px] bg-lime border-[2px] border-ink shadow-ink font-display font-bold text-[16px] text-ink active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none mt-auto"
          disabled={!firstName.trim() || !lastName.trim()}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </Screen>
  )
}
