import { Badge, BadgeProps } from '@/components/ui/badge'
import { cn } from '@/utils/web/cn'

export type Status = 'live' | 'not-started' | 'called' | 'unknown'

interface LiveStatusBadgeProps {
  status: Status
  className?: string
}

export function LiveStatusBadge(props: LiveStatusBadgeProps) {
  const { status, className } = props

  switch (status) {
    case 'live':
      return <LiveBadge className={className} />
    case 'called':
      return <CalledBadge className={className} />
    case 'not-started':
      return <NotStartedBadge className={className} />
    default:
      return null
  }
}

function LiveBadge({ className, ...props }: BadgeProps) {
  return (
    <Badge className={cn('py-1 text-base', className)} variant="green-subtle" {...props}>
      <span className="relative mr-2 flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-700 opacity-75"></span>
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-700"></span>
      </span>
      Live
    </Badge>
  )
}

function NotStartedBadge({ className, ...props }: BadgeProps) {
  return (
    <Badge className={cn('py-1 text-base', className)} variant="gray-subtle" {...props}>
      Not started
    </Badge>
  )
}

function CalledBadge({ className, ...props }: BadgeProps) {
  return (
    <Badge className={cn('py-1 text-base', className)} variant="primary-cta-subtle" {...props}>
      Final
    </Badge>
  )
}
