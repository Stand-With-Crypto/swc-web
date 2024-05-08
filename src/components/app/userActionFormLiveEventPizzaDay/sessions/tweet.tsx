'use client'

import { useState } from 'react'
import { UserActionType } from '@prisma/client'
import { toast } from 'sonner'

import {
  actionCreateUserActionLiveEvent,
  CreateActionLiveEventInput,
} from '@/actions/actionCreateUserActionLiveEvent'
import { useCongresspersonData } from '@/components/app/userActionFormCallCongressperson/sections/address'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_LIVE_EVENT,
  PizzaDaySectionNames,
} from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { UseSectionsReturn } from '@/hooks/useSections'
import { useSession } from '@/hooks/useSession'
import {
  convertDTSIPersonStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'
import { createTweetLink } from '@/utils/web/createTweetLink'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

const congresspersonMock = {
  id: 'f816c6b9-b19d-48bc-bfa8-ea456fc12f88',
  twitterAccounts: [
    {
      id: '164bc625-3de1-49f9-9694-235e3fad6907',
      state: 'VISIBLE',
      username: 'RepAdamSchiff',
    },
  ],
  suffixName: '',
  slug: 'adam---schiff',
  primaryRole: {
    dateEnd: '2025-01-03T00:00:00.000Z',
    dateStart: '2023-01-03T00:00:00.000Z',
    id: '1c9f7f67-086b-4995-a8cb-6c13e02f080a',
    primaryCity: '',
    primaryCountryCode: 'US',
    primaryDistrict: '30',
    primaryState: 'CA',
    roleCategory: 'CONGRESS',
    status: 'HELD',
    title: '',
  },
  donationUrl: '',
  firstName: 'Adam',
  firstNickname: '',
  gender: 'MALE',
  lastName: 'Schiff',
  manuallyOverriddenStanceScore: null,
  middleName: 'B.',
  nameSuffix: '',
  nameUniquenessModifier: '',
  officialUrl: 'https://schiff.house.gov',
  phoneNumber: '12022254176',
  politicalAffiliationCategory: 'DEMOCRAT',
  politicalAffiliation: 'Democratic Party (United States)',
  computedStanceScore: 50,
  stances: [],
  profilePictureUrl:
    'https://db0prh5pvbqwd.cloudfront.net/all/images/7875ec89-a7a5-410f-a1af-343b51fe142a.jpg',
  profilePictureUrlDimensions: { type: 'jpg', width: 2866, height: 3593 },
}

export function TweetPizzaDayLiveEvent({ goToSection }: UseSectionsReturn<PizzaDaySectionNames>) {
  const [hasUserTweeted, setHasUserTweeted] = useState(true)
  const [isMintingNFT, setIsMintingNFT] = useState(false)
  const { user } = useSession()

  const userAddress = user?.address
    ? { place_id: user.address.googlePlaceId, description: user.address.formattedDescription }
    : undefined

  const { data: resolvedCongressPersonData, isLoading: isLoadingInitialCongresspersonData } =
    useCongresspersonData({ address: userAddress })

  if (!user || isLoadingInitialCongresspersonData) return null

  console.log({ resolvedCongressPersonData })

  const userStateMock = 'NY'

  function getTweetMessageBasedOnRepresentativeScore() {
    if (resolvedCongressPersonData?.notFoundReason)
      return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕
    May 22nd is Bitcoin Pizza Day! Like many other politicians my representative doesn’t understand the importance of crypto for America. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto #${userStateMock}
    `

    const representativeXHandle: string =
      congresspersonMock?.twitterAccounts.reduce((xHandle, account) => {
        if (account?.username) return (xHandle = `@${account.username}`)

        return xHandle
      }, '') ?? `${congresspersonMock.firstName} ${congresspersonMock.lastName}`

    return (() => {
      switch (convertDTSIPersonStanceScoreToLetterGrade(congresspersonMock)) {
        case DTSILetterGrade.A || DTSILetterGrade.B:
          return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕 May 22nd is Bitcoin Pizza Day! I applaud my representative ${representativeXHandle} for protecting Americans’ right to own crypto. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto #${userStateMock}
          `
        case DTSILetterGrade.C || null:
          return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕 May 22nd is Bitcoin Pizza Day! I’m asking my representative ${representativeXHandle} to protect Americans’ right to own crypto. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto #${userStateMock}`
        case DTSILetterGrade.D || DTSILetterGrade.F:
          return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕 May 22nd is Bitcoin Pizza Day! Like many other politicians my representative doesn’t understand the importance of crypto for America. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto #${userStateMock}
          `
        default:
          return ''
      }
    })()
  }

  async function handleClaimNft() {
    setIsMintingNFT(true)
    const data: CreateActionLiveEventInput = {
      campaignName: UserActionLiveEventCampaignName['2024_05_22_PIZZA_DAY'],
    }

    const result = await triggerServerActionForForm(
      {
        formName: ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_LIVE_EVENT,
        onError: (_, error) => {
          toast.error(error.message, {
            duration: 5000,
          })
        },
        analyticsProps: {
          'Campaign Name': data.campaignName,
          'User Action Type': UserActionType.PIZZA_DAY,
        },
        payload: data,
      },
      payload =>
        actionCreateUserActionLiveEvent(payload).then(actionResult => {
          if (actionResult?.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )

    if (result.status === 'success') {
      goToSection(PizzaDaySectionNames.SUCCESS)
    } else {
      toastGenericError()
    }
    setIsMintingNFT(false)
  }

  async function handleButtonClick() {
    if (!hasUserTweeted) return setHasUserTweeted(true)

    await handleClaimNft()
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <PageTitle as="h3" className="mb-4 lg:my-10" size="lg">
        Tweet your representative
      </PageTitle>
      <p className="text-center text-fontcolor-muted">
        Send a tweet to your representative and then come back here to claim your free NFT.
      </p>

      {!hasUserTweeted && (
        <div className="my-6 rounded-2xl bg-gray-200 p-6">
          <p>{getTweetMessageBasedOnRepresentativeScore()}</p>
        </div>
      )}

      <Button
        asChild={!hasUserTweeted}
        className="mt-auto w-full md:w-1/2"
        disabled={isMintingNFT}
        onClick={handleButtonClick}
        size="lg"
      >
        {hasUserTweeted ? (
          isMintingNFT ? (
            'Minting your NFT...'
          ) : (
            'I tweeted my representative'
          )
        ) : (
          <ExternalLink
            href={createTweetLink({
              message: getTweetMessageBasedOnRepresentativeScore(),
              url: 'https://www.standwithcrypto.org/pizza',
            })}
          >
            Send tweet
          </ExternalLink>
        )}
      </Button>
    </div>
  )
}
