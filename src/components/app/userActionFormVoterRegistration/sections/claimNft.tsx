'use client'

import { useCallback, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  actionCreateUserActionVoterRegistration,
  CreateActionVoterRegistrationInput,
} from '@/actions/actionCreateUserActionVoterRegistration'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { SectionNames } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { UseSectionsReturn } from '@/hooks/useSections'
import { UserActionValidationErrors } from '@/utils/server/userActionValidation/constants'
import { NFTSlug } from '@/utils/shared/nft'
import { UserActionVoterRegistrationCampaignName } from '@/utils/shared/userActionCampaigns'
import type { USStateCode } from '@/utils/shared/usStateUtils'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'
import { toastGenericError } from '@/utils/web/toastUtils'

const I_AM_A_VOTER_NFT_IMAGE = NFT_CLIENT_METADATA[NFTSlug.I_AM_A_VOTER].image

interface ClaimNftProps extends UseSectionsReturn<SectionNames> {
  stateCode?: USStateCode
}

export function ClaimNft({ goToSection, stateCode }: ClaimNftProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleOnBack = useCallback(() => {
    goToSection(SectionNames.SURVEY)
  }, [goToSection])

  const handleClaimNft = useCallback(async () => {
    setLoading(true)
    const data: CreateActionVoterRegistrationInput = {
      campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
      usaState: stateCode,
    }

    const result = await triggerServerActionForForm(
      {
        formName: 'User Action Form Voter Registration',
        onError: (key, error) => {
          if (key === UserActionValidationErrors.ACTION_UNAVAILABLE) {
            toast.error('Action unavailable', {
              description: error.message,
            })
          }
          toastGenericError()
        },
        analyticsProps: {
          'Campaign Name': data.campaignName,
          'User Action Type': UserActionType.VOTER_REGISTRATION,
          State: data.usaState,
        },
        payload: data,
      },
      payload =>
        actionCreateUserActionVoterRegistration(payload).then(actionResult => {
          if (actionResult && 'user' in actionResult && actionResult.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )

    if (result.status === 'success') {
      router.refresh()
      goToSection(SectionNames.SUCCESS)
    }
    setLoading(false)
  }, [goToSection, router, stateCode])

  return (
    <UserActionFormLayout onBack={handleOnBack}>
      <UserActionFormLayout.Container>
        <UserActionFormLayout.Heading title="Claim “I'm a Voter” NFT" />
        <div className="flex w-full flex-col items-center gap-8 md:flex-row">
          <NextImage
            alt={I_AM_A_VOTER_NFT_IMAGE.alt}
            height={I_AM_A_VOTER_NFT_IMAGE.height}
            src={I_AM_A_VOTER_NFT_IMAGE.url}
            width={I_AM_A_VOTER_NFT_IMAGE.width}
          />
          <p className="text-fontcolor-muted">
            The “I'm a Voter” NFT was created by{' '}
            <ExternalLink href="https://pplplsr.com/About">pplpleasr</ExternalLink>
            , in partnership with Stand With Crypto, to highlight the power of the crypto community
            to mobilize and vote in the 2024 elections.
            <br /> <br /> Limited to one mint per person.
          </p>
        </div>
      </UserActionFormLayout.Container>
      <UserActionFormLayout.Footer>
        <Button disabled={loading} onClick={handleClaimNft} size="lg">
          Claim NFT
        </Button>
      </UserActionFormLayout.Footer>
    </UserActionFormLayout>
  )
}
