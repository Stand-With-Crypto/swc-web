'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { ORDERED_USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useLocale } from '@/hooks/useLocale'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { UserActionType } from '@prisma/client'

import { Skeleton } from '@/components/ui/skeleton'
import { useAuthUser } from '@/hooks/useAuthUser'
import { UserActionFormCallCongresspersonLayout } from './layout'

export function SuccessMessage() {
  const router = useRouter()
  const locale = useLocale()
  const { data } = useApiResponseForUserPerformedUserActionTypes()

  const nextAction = React.useMemo(() => {
    const action = ORDERED_USER_ACTION_ROW_CTA_INFO.find(
      action => !data?.performedUserActionTypes.includes(action.actionType),
    )
    if (action) {
      const { DialogComponent: _DialogComponent, ...rest } = action
      return rest
    }
    return null
  }, [data])

  return (
    <UserActionFormCallCongresspersonLayout>
      <UserActionFormCallCongresspersonLayout.Container>
        <SuccessMessageContent />

        <UserActionFormCallCongresspersonLayout.Footer>
          <div>
            <div className="font-bold">Up next</div>
            {/* 
              We can't open a modal within a modal, and so we redirect the user to our deeplink modal pages. 
              There might be better options but this seems like the path of least resistance with minimal UX downside ¯\_(ツ)_/¯ 
            */}
            {nextAction && (
              <UserActionRowCTAButton
                {...nextAction}
                onClick={() =>
                  router.replace(
                    USER_ACTION_DEEPLINK_MAP[nextAction.actionType].getDeeplinkUrl({ locale }),
                  )
                }
                state="unknown"
              />
            )}
          </div>
        </UserActionFormCallCongresspersonLayout.Footer>
      </UserActionFormCallCongresspersonLayout.Container>
    </UserActionFormCallCongresspersonLayout>
  )
}

function SuccessMessageContent() {
  const authUser = useAuthUser()

  if (authUser.isLoading) {
    return <SuccessMessageSkeleton />
  }

  if (authUser.isLoggedIn) {
    return <AuthenticatedSuccessContent />
  }

  return <UnauthenticatedSuccessContent />
}

function UnauthenticatedSuccessContent() {
  const locale = useLocale()

  const href = React.useMemo(() => {
    return USER_ACTION_DEEPLINK_MAP[UserActionType.OPT_IN].getDeeplinkUrl({ locale })
  }, [locale])

  return (
    <div className="flex flex-col items-center gap-6">
      <NFTDisplay />

      <PageTitle size="md">Nice work! Get an NFT for calling</PageTitle>

      <PageSubTitle>Join Stand with Crypto to get an NFT.</PageSubTitle>

      <Button variant="secondary" asChild>
        <InternalLink href={href}>Join Stand with Crypto</InternalLink>
      </Button>
    </div>
  )
}

function AuthenticatedSuccessContent() {
  return (
    <div className="flex flex-col items-center gap-6">
      <NFTDisplay />

      <PageTitle size="md">Nice work! You got an NFT for calling</PageTitle>

      <PageSubTitle>
        You did your part to save cryptocurrency, but the fight isn't over yet.
      </PageSubTitle>

      <Button variant="secondary">Share on Twitter/X (TODO)</Button>
    </div>
  )
}

function NFTDisplay() {
  return (
    <div className="h-40 w-40 overflow-hidden rounded-xl bg-primary">
      <NextImage
        src="/actionsNftRewards/call.gif"
        alt="NFT awarded for calling congressperson"
        width={160}
        height={160}
      />
    </div>
  )
}

function SuccessMessageSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6">
      <NFTDisplay />

      <PageTitle size="md">
        <Skeleton>Nice work! Get an NFT for calling</Skeleton>
      </PageTitle>

      <PageSubTitle>
        <Skeleton>Join Stand with Crypto to get an NFT.</Skeleton>
      </PageSubTitle>

      <Button variant="secondary">
        <Skeleton>Join Stand with Crypto</Skeleton>
      </Button>
    </div>
  )
}
