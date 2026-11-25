import Image from 'next/image'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/ui/initials'

interface InitialsAvatarProps {
  name: string
  src?: string | null
  size?: number
  className?: string
}

/** A person's photo, or their initials on a neutral circle (one style for every table). */
export function InitialsAvatar({ name, src, size = 32, className }: InitialsAvatarProps) {
  const style = { width: size, height: size }
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={style}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-muted text-muted-foreground inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        className
      )}
      style={style}
    >
      {initials(name)}
    </span>
  )
}
