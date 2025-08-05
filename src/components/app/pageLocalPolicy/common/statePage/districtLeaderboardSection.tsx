import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'

interface DistrictLeaderboardButtonProps extends React.PropsWithChildren {
  href: string
}

export function DistrictLeaderboard({ children }: React.PropsWithChildren) {
  return <div className="space-y-8">{children}</div>
}

function DistrictLeaderboardButton({ children, href }: DistrictLeaderboardButtonProps) {
  return (
    <div className="container space-x-4 text-center">
      <Button asChild variant="secondary">
        <InternalLink href={href}>{children}</InternalLink>
      </Button>
    </div>
  )
}
DistrictLeaderboard.Button = DistrictLeaderboardButton
