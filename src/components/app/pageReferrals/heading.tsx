'use client'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'

export function PageReferralsHeading() {
  const { isLoggedIn, isLoading } = useSession()
  const hasHydrated = useHasHydrated()

  if (!isLoggedIn || isLoading || !hasHydrated) {
    return (
      <section className="space-y-7 text-center">
        <PageTitle>Referral Leaderboard</PageTitle>
        <PageSubTitle>
          See which districts have referred the most number of new advocates into SWC{' '}
        </PageSubTitle>
      </section>
    )
  }

  return (
    <section className="space-y-7 text-center">
      <PageTitle>
        Invite a friend to join
        <br />
        <span className="inline-block">Stand With Crypto</span>
      </PageTitle>
      <PageSubTitle>
        Send your friends your unique referral code to encourage them to signup and take action
      </PageSubTitle>
    </section>
  )
}
