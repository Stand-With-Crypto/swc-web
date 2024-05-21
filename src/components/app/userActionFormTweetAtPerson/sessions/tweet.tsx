'use client'

import { useEffect, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  actionCreateUserActionTweetedAtPerson,
  CreateActionTweetAtPersonInput,
} from '@/actions/actionCreateUserActionTweetAtPerson'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { useCongresspersonData } from '@/components/app/userActionFormCallCongressperson/sections/address'
import {
  CAMPAIGN_METADATA,
  TweetAtPersonSectionNames,
} from '@/components/app/userActionFormTweetAtPerson/constants'
import { TweetAtPersonSectionSkeleton } from '@/components/app/userActionFormTweetAtPerson/skeletons/tweetSkeleton'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleFromCongressionalDistrict } from '@/hooks/useGetDTSIPeopleFromAddress'
import { UseSectionsReturn } from '@/hooks/useSections'
import { useSession } from '@/hooks/useSession'
import { SupportedLocale } from '@/intl/locales'
import {
  convertDTSIPersonStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { UserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns'
import { createTweetLink } from '@/utils/web/createTweetLink'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'
import { zodAddress } from '@/validation/fields/zodAddress'

type OnFindCongressPersonPayload = DTSIPeopleFromCongressionalDistrict & {
  addressSchema: z.infer<typeof zodAddress>
}

interface TweetAtPersonSectionProps {
  slug: UserActionTweetAtPersonCampaignName
  sectionProps: UseSectionsReturn<TweetAtPersonSectionNames>
}

export function TweetAtPersonSection({
  slug,
  sectionProps: { goToSection },
}: TweetAtPersonSectionProps) {
  const [congressPersonData, setCongresspersonData] = useState<OnFindCongressPersonPayload>()
  const [hasUserTweeted, setHasUserTweeted] = useState(false)
  const [isMintingNFT, setIsMintingNFT] = useState(false)
  const { user } = useSession()

  const userAddress = user?.address
    ? { place_id: user.address.googlePlaceId, description: user.address.formattedDescription }
    : undefined

  const { data: resolvedCongressPersonData, isLoading: isLoadingInitialCongresspersonData } =
    useCongresspersonData({ address: userAddress })

  const congressPersonNotFound = !!resolvedCongressPersonData?.notFoundReason

  const representative = congressPersonData?.dtsiPeople?.find(
    person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS,
  )

  function getTweetMessageBasedOnRepresentativeScore() {
    if (congressPersonNotFound) {
      return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕
May 22nd is Bitcoin Pizza Day! I applaud all the representatives who are protecting Americans’ right to own crypto. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto
      `
    }

    if (!representative) {
      return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕
May 22nd is Bitcoin Pizza Day! I applaud all the representatives who are protecting Americans’ right to own crypto. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto
      `
    }

    const representativeXHandle =
      representative?.twitterAccounts.reduce((xHandle, account) => {
        if (account?.username) return (xHandle = `@${account.username}`)

        return xHandle
      }, '') ?? `${representative.firstName} ${representative.lastName}`

    return (() => {
      switch (convertDTSIPersonStanceScoreToLetterGrade(representative)) {
        case DTSILetterGrade.A:
        case DTSILetterGrade.B:
          return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕
May 22nd is Bitcoin Pizza Day! I applaud my representative ${representativeXHandle} for protecting Americans’ right to own crypto. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto #${user?.userLocationDetails?.administrativeAreaLevel1 ?? ''}
          `
        case DTSILetterGrade.C:
        case null:
          return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕
May 22nd is Bitcoin Pizza Day! I’m asking my representative ${representativeXHandle} to protect Americans’ right to own crypto. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto #${user?.userLocationDetails?.administrativeAreaLevel1 ?? ''}`
        case DTSILetterGrade.D:
        case DTSILetterGrade.F:
          return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕
May 22nd is Bitcoin Pizza Day! Like many other politicians my representative doesn’t understand the importance of crypto for America. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto #${user?.userLocationDetails?.administrativeAreaLevel1 ?? ''}
          `
        default:
          return `🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕
May 22nd is Bitcoin Pizza Day! I applaud all the representatives who are protecting Americans’ right to own crypto. See where your representative stands at www.standwithcrypto.org/pizza and join the fight! #StandWithCrypto
                `
      }
    })()
  }

  async function handleClaimNft() {
    setIsMintingNFT(true)

    const data: CreateActionTweetAtPersonInput = {
      campaignName: slug,
      dtsiSlug: representative?.slug ?? null,
    }

    const result = await triggerServerActionForForm(
      {
        formName: CAMPAIGN_METADATA[slug].analyticsName,
        onError: (_, error) => {
          toast.error(error.message, {
            duration: 5000,
          })
        },
        analyticsProps: {
          'Campaign Name': data.campaignName,
          'User Action Type': UserActionType.TWEET_AT_PERSON,
          dtsiSlug: representative?.slug ?? null,
        },
        payload: data,
      },
      payload =>
        actionCreateUserActionTweetedAtPerson(payload).then(actionResult => {
          if (actionResult?.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )

    if (result.status === 'success') {
      goToSection(TweetAtPersonSectionNames.SUCCESS)
    } else {
      toastGenericError()
    }
    setIsMintingNFT(false)
  }

  async function handleButtonClick() {
    if (!hasUserTweeted) return setHasUserTweeted(true)

    await handleClaimNft()
  }

  useEffect(() => {
    if (resolvedCongressPersonData && 'dtsiPeople' in resolvedCongressPersonData) {
      setCongresspersonData(resolvedCongressPersonData)
    }
  }, [resolvedCongressPersonData])

  if (!user || isLoadingInitialCongresspersonData) return <TweetAtPersonSectionSkeleton />

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <PageTitle as="h3" className="lg:text-1xl mb-4 lg:mb-10" size="lg">
        {congressPersonNotFound ? 'Tweet on Pizza Day' : 'Tweet your representative'}
      </PageTitle>
      <p className="mb-6 text-center text-fontcolor-muted">
        {congressPersonNotFound
          ? 'Send a tweet to celebrate Pizza Day and then come back here to claim your free NFT.'
          : 'Send a tweet to your representative and then come back here to claim your free NFT.'}
      </p>

      {representative && (
        <div className="align-center mb-6 flex w-full justify-center">
          <DTSIPersonHeroCard
            isClickable={false}
            isRecommended={false}
            locale={SupportedLocale.EN_US}
            person={representative}
            subheader="role-w-state"
          />
        </div>
      )}

      {!hasUserTweeted && (
        <div className="mb-6 w-full max-w-[320px] rounded-2xl bg-backgroundAlternate p-6 lg:max-w-[600px]">
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
          ) : congressPersonNotFound ? (
            'I tweeted'
          ) : (
            'I tweeted my representative'
          )
        ) : (
          <ExternalLink
            href={createTweetLink({
              message: getTweetMessageBasedOnRepresentativeScore(),
            })}
          >
            Send tweet
          </ExternalLink>
        )}
      </Button>
    </div>
  )
}
