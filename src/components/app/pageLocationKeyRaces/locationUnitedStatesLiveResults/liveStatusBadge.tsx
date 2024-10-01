import { DotFilledIcon } from '@radix-ui/react-icons'

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
    <Badge className={cn('px-2 py-1 pr-5 text-base', className)} variant="green-subtle" {...props}>
      <DotFilledIcon className="h-[30px] w-[30px]" />
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
      Called
    </Badge>
  )
}
