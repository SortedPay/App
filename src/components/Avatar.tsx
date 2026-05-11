import { User } from '../lib/mockData'

type Props = {
  user: Pick<User, 'initials' | 'color' | 'firstName'>
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'huge'
  className?: string
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

export default function Avatar({ user, size = 'md', className = '' }: Props) {
  return (
    <div
      className={`${SIZES[size]} ${BG[user.color]} ${className} rounded-full border-2 border-ink flex items-center justify-center font-display font-bold tracking-tight shrink-0`}
    >
      {user.initials}
    </div>
  )
}
