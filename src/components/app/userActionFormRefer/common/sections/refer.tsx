'use client'

import { ReactNode } from 'react'

import { ReferralsCounter } from '@/components/app/pageReferrals/referralsCounter'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/common/userReferralUrl'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { PageTitle } from '@/components/ui/pageTitleText'

export function Refer({ children }: { children: ReactNode }) {
  return (
    <UserActionFormLayout className="min-h-max">
      <UserActionFormLayout.Container className="h-auto items-center justify-around">
        {children}
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

Refer.Heading = function ReferHeading({ description }: { description: string }) {
  return (
    <div className="flex w-full flex-col gap-2 text-center">
      <div>
        <PageTitle size="sm">Invite a friend to join</PageTitle>
        <PageTitle size="sm">Stand With Crypto</PageTitle>
      </div>
      <p className="text-fontcolor-muted">{description}</p>
    </div>
  )
}

Refer.ReferralCode = function ReferralCode() {
  return <UserReferralUrlWithApi />
}

Refer.Counter = ReferralsCounter
