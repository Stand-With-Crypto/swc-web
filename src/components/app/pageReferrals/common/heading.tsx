'use client'

import { PageReferrals } from '@/components/app/pageReferrals/common'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'

interface PageReferralsHeadingProps {
  stateName?: string
  leaderboardTitle: string
  leaderboardSubtitle: string
}

export function PageReferralsHeading({
  stateName,
  leaderboardTitle,
  leaderboardSubtitle,
}: PageReferralsHeadingProps) {
  const { isLoggedIn, isLoading } = useSession()
  const hasHydrated = useHasHydrated()

  if (!isLoggedIn || isLoading || !hasHydrated || stateName) {
    return (
      <PageReferrals.Heading>
        <PageTitle>{leaderboardTitle}</PageTitle>
        <PageSubTitle>{leaderboardSubtitle}</PageSubTitle>
      </PageReferrals.Heading>
    )
  }

  return (
    <PageReferrals.Heading>
      <PageTitle>
        Invite a friend to join
        <br />
        <span className="inline-block">Stand With Crypto</span>
      </PageTitle>
      <PageSubTitle>
        Send your friends your unique referral code to encourage them to signup and take action
      </PageSubTitle>
    </PageReferrals.Heading>
  )
}
