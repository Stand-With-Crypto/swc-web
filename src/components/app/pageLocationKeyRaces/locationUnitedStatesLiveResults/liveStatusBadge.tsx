import { Badge, BadgeProps } from '@/components/ui/badge'
import { cn } from '@/utils/web/cn'

export type RaceStatus = 'live' | 'not-started' | 'called' | 'runoff' | 'unknown'

interface LiveStatusBadgeProps {
  status: RaceStatus
  winnerName?: string
  className?: string
}

export function LiveStatusBadge(props: LiveStatusBadgeProps) {
  const { status, winnerName, className } = props

  switch (status) {
    case 'live':
      return <LiveBadge className={className} />
    case 'called':
      return <CalledBadge className={className} winnerName={winnerName} />
    case 'not-started':
      return <NotStartedBadge className={className} />
    case 'runoff':
      return <RunoffBadge className={className} />
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

function CalledBadge({ className, winnerName, ...props }: BadgeProps & { winnerName?: string }) {
  return (
    <Badge className={cn('py-1 text-base', className)} variant="primary-cta-subtle" {...props}>
      {winnerName ? `Winner: ${winnerName}` : 'Final'}
    </Badge>
  )
}

function RunoffBadge({ className, ...props }: BadgeProps) {
  return (
    <Badge className={cn('py-1 text-base', className)} variant="green-subtle" {...props}>
      Advancing candidates
    </Badge>
  )
}
