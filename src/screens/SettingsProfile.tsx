import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Camera, X } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { useStore } from '../lib/store'
import { saveAvatar, deleteAvatar, resizeImage } from '../lib/imageStore'

const COLORS = [
  { id: 'lime', bg: 'bg-lime' },
  { id: 'coral', bg: 'bg-coral' },
  { id: 'sky', bg: 'bg-sky' },
  { id: 'butter', bg: 'bg-butter' },
  { id: 'plum', bg: 'bg-plum' },
] as const

export default function SettingsProfile() {
  const user = useStore((s) => s.user)
  const updateUser = useStore((s) => s.updateUser)
  const avatarUrl = useStore((s) => s.avatarUrl)
  const setAvatarUrl = useStore((s) => s.setAvatarUrl)
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [color, setColor] = useState<typeof user.color>(user.color)
  const [saved, setSaved] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const dirty =
    firstName !== user.firstName || lastName !== user.lastName || color !== user.color
  const valid = firstName.trim().length > 0

  function handleSave() {
    if (!dirty || !valid) return
    updateUser({ firstName: firstName.trim(), lastName: lastName.trim(), color })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate(-1)
    }, 900)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    try {
      // Resize client-side so we never put a 4MB photo into IDB
      const blob = await resizeImage(file, 512, 0.85)
      await saveAvatar(user.handle, blob)
      const url = URL.createObjectURL(blob)
      setAvatarUrl(url)
    } catch (err) {
      console.error('Avatar upload failed', err)
      setUploadError("Couldn't load that image. Try another?")
    } finally {
      // Reset the input so picking the same file again triggers onChange
      if (e.target) e.target.value = ''
    }
  }

  async function handleRemovePicture() {
    if (!confirm('Remove profile picture? Your initials will show instead.')) return
    try {
      await deleteAvatar(user.handle)
      setAvatarUrl(null)
    } catch (err) {
      console.error('Avatar delete failed', err)
    }
  }

  const previewUser = { ...user, firstName, lastName, color }

  return (
    <Screen transition="slide" className="min-h-screen flex flex-col px-6 pb-6">
      <Header title="PROFILE" />

      {/* Avatar preview with camera badge */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="relative">
          <motion.div
            key={color}
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          >
            <Avatar user={previewUser} size="xl" imageUrl={avatarUrl} />
          </motion.div>

          {/* Camera badge — bottom-right of avatar */}
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

        {/* Tiny "Remove" link if there's an uploaded avatar */}
        {avatarUrl && (
          <button
            onClick={handleRemovePicture}
            className="mt-3 inline-flex items-center gap-1 font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted active:text-coral transition-colors"
          >
            <X size={11} strokeWidth={2.6} />
            Remove picture
          </button>
        )}

        {uploadError && (
          <p className="mt-2 font-body text-[12px] text-coral">{uploadError}</p>
        )}

        {/* Colour swatches — only when no uploaded avatar */}
        {!avatarUrl && (
          <div className="flex justify-center gap-2.5 mt-4">
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
      </div>

      {/* Form */}
      <div className="space-y-3.5 mb-4">
        <Field label="First name" value={firstName} onChange={setFirstName} />
        <Field label="Last name" value={lastName} onChange={setLastName} />
        <ReadOnlyField label="@handle" value={`@${user.handle}`} />
        <ReadOnlyField label="Mobile" value="+61 04XX XXX 921" />
      </div>

      <p className="text-[12px] text-ink-muted text-center max-w-[28ch] mx-auto mb-4">
        Your handle is permanent. Mobile changes need to re-verify.
      </p>

      <div className="flex-1" />

      <button
        disabled={!dirty || !valid}
        onClick={handleSave}
        className={`
          w-full py-4 rounded-[14px] border-[2px]
          font-display font-bold text-[16px] tracking-tight
          flex items-center justify-center gap-2
          transition-all duration-100
          ${
            dirty && valid
              ? 'bg-lime text-ink border-ink shadow-ink active:translate-y-[3px] active:shadow-none'
              : 'bg-line-soft text-ink-muted border-line opacity-70 cursor-not-allowed'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.span
              key="saved"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <Check size={16} strokeWidth={3} /> Saved
            </motion.span>
          ) : (
            <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Save changes
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </Screen>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted block mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-paper-elevated border-[1.5px] border-line rounded-[14px] outline-none focus:border-ink transition-colors font-body font-medium text-[16px] text-ink py-[14px] px-[18px]"
        autoCapitalize="words"
      />
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="font-mono font-semibold text-[10px] uppercase tracking-[0.18em] text-ink-muted block mb-2">
        {label}
      </label>
      <div className="w-full bg-paper-deep border-[1.5px] border-line rounded-[14px] py-[14px] px-[18px] font-body font-medium text-[15px] text-ink-muted">
        {value}
      </div>
    </div>
  )
}
