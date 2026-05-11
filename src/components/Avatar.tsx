import { User } from '../lib/mockData'

type Props = {
  user: Pick<User, 'initials' | 'color' | 'firstName'>
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'huge'
  className?: string
  // Object URL (or data URL) for an uploaded profile picture.
  // When present, replaces the initials block.
  imageUrl?: string | null
}

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'w-9 h-9 text-[12px]',
  md: 'w-11 h-11 text-[13px]',
  lg: 'w-14 h-14 text-[16px]',
  xl: 'w-20 h-20 text-[22px]',
  huge: 'w-28 h-28 text-[30px]',
}

const BG: Record<User['color'], string> = {
  lime: 'bg-lime text-ink',
  coral: 'bg-coral text-paper',
  sky: 'bg-sky text-ink',
  butter: 'bg-butter text-ink',
  plum: 'bg-plum text-paper',
}

export default function Avatar({ user, size = 'md', className = '', imageUrl }: Props) {
  const base = `${SIZES[size]} ${className} rounded-full border-2 border-ink shrink-0 overflow-hidden`

  if (imageUrl) {
    return (
      <div className={base}>
        <img
          src={imageUrl}
          alt={user.firstName}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div
      className={`${base} ${BG[user.color]} flex items-center justify-center font-display font-bold tracking-tight`}
    >
      {user.initials}
    </div>
  )
}
