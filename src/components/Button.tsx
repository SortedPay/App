import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref' | 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-lime text-ink border-ink shadow-ink active:translate-y-[3px] active:shadow-ink-sm',
  secondary: 'bg-paper-elevated text-ink border-ink shadow-ink active:translate-y-[3px] active:shadow-ink-sm',
  ghost: 'bg-transparent text-ink border-transparent shadow-none active:bg-line-soft',
  danger: 'bg-coral text-paper border-ink shadow-ink active:translate-y-[3px] active:shadow-ink-sm',
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2.5 text-[13px] rounded-[12px]',
  md: 'px-5 py-3.5 text-[15px] rounded-[14px]',
  lg: 'px-6 py-4 text-[17px] rounded-[18px]',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    iconLeft,
    iconRight,
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading
  const borderWidth = variant === 'ghost' ? 'border-0' : 'border-[2.5px]'

  return (
    <motion.button
      ref={ref}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.08 }}
      disabled={isDisabled}
      className={`
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${borderWidth}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        font-display font-bold tracking-tight
        flex items-center justify-center gap-2
        transition-[transform,box-shadow] duration-75
        select-none
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
      ) : (
        iconLeft && <span className="flex-shrink-0">{iconLeft}</span>
      )}
      <span>{children}</span>
      {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
    </motion.button>
  )
})
