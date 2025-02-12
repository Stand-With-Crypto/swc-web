import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'

import { UserReferralUrl } from '@/components/app/pageUserProfile/userReferralUrl'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'

export function UserActionFormRefer() {
  const { data } = useApiResponseForUserFullProfileInfo()
  const user = data?.user ?? null
  const referralId = user?.referralId ?? ''

  const referralsCount = useMemo(
    () =>
      user?.userActions.find(action => action.actionType === UserActionType.REFER)
        ?.referralsCount ?? 0,
    [user?.userActions],
  )

  return (
    <UserActionFormLayout className="min-h-max">
      <UserActionFormLayout.Container className="h-auto items-center justify-between">
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

        <div className="flex w-full gap-4">
          <div className="flex w-full flex-col justify-between gap-10 rounded-2xl bg-primary-cta p-4 text-white">
            <p className="text-sm font-medium">Your referrals</p>
            <p className="text-5xl font-semibold">{referralsCount}</p>
          </div>

          <div className="flex w-full flex-col justify-between gap-10 rounded-2xl bg-secondary p-4">
            <p className="text-sm font-medium">District ranking</p>
            <p className="text-5xl font-semibold">#[PH]</p>
          </div>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
