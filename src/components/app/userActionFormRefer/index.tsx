import { ReferralsCounter } from '@/components/app/pageReferrals/referralsCounter'
import { UserReferralUrl } from '@/components/app/pageUserProfile/userReferralUrl'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'

export function UserActionFormRefer() {
  const { data } = useApiResponseForUserFullProfileInfo()
  const user = data?.user ?? null
  const referralId = user?.referralId ?? ''

  return (
    <UserActionFormLayout className="min-h-max">
      <UserActionFormLayout.Container className="h-auto items-center justify-around">
        <div className="flex w-full flex-col gap-2 text-center">
          <div>
            <PageTitle size="sm">Invite a friend to join</PageTitle>
            <PageTitle size="sm">Stand With Crypto</PageTitle>
          </div>
          <p className="text-fontcolor-muted">
            Send friends your unique referral code to encourage them to sign up and take action.
          </p>
        </div>

        <UserReferralUrl referralId={referralId} />

        <ReferralsCounter className="flex-col md:flex-row" />
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
