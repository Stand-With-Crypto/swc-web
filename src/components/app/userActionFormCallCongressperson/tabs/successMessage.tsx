'use client'

import React from 'react'
import { useUser } from '@thirdweb-dev/react'
import { useRouter } from 'next/navigation'

import { ORDERED_USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { useLocale } from '@/hooks/useLocale'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { Button } from '@/components/ui/button'
import { UserActionType } from '@prisma/client'
import { InternalLink } from '@/components/ui/link'
import { NextImage } from '@/components/ui/image'

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
      const { DialogComponent, ...rest } = action
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
  const authUser = useUser()

  if (authUser.isLoading) {
    return <span>loading...</span>
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
  }, [])

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
