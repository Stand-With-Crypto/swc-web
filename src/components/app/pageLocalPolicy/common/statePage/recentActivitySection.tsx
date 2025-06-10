import { VariantRecentActivityRow } from '@/components/app/recentActivityRow/variantRecentActivityRow'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface RecentActivityContentProps {
  countryCode: SupportedCountryCodes
  publicRecentActivity: PublicRecentActivity['data']
}

interface RecentActivityButtonProps extends React.PropsWithChildren {
  href: string
}

export function RecentActivity({ children }: React.PropsWithChildren) {
  return <div className="space-y-8 lg:space-y-10">{children}</div>
}

function RecentActivityContent({ countryCode, publicRecentActivity }: RecentActivityContentProps) {
  return publicRecentActivity.map(action => (
    <VariantRecentActivityRow action={action} countryCode={countryCode} key={action.id} />
  ))
}
RecentActivity.Content = RecentActivityContent

function RecentActivityButton({ children, href }: RecentActivityButtonProps) {
  return (
    <div className="container space-x-4 text-center">
      <Button asChild variant="secondary">
        <InternalLink href={href}>{children}</InternalLink>
      </Button>
    </div>
  )
}
RecentActivity.Button = RecentActivityButton
