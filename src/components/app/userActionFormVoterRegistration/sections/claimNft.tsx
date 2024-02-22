'use client'

import { useCallback, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'

import {
  actionCreateUserActionVoterRegistration,
  CreateActionVoterRegistrationInput,
} from '@/actions/actionCreateUserActionVoterRegistration'
import { SectionNames, StateCode } from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationLayout } from '@/components/app/userActionFormVoterRegistration/sections/layout'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { UseSectionsReturn } from '@/hooks/useSections'
import { NFTSlug } from '@/utils/shared/nft'
import { UserActionVoterRegistrationCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'
import { toastGenericError } from '@/utils/web/toastUtils'

const I_AM_A_VOTER_NFT_IMAGE = NFT_CLIENT_METADATA[NFTSlug.I_AM_A_VOTER].image

interface ClaimNftProps extends UseSectionsReturn<SectionNames> {
  stateCode?: StateCode
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
        onError: toastGenericError,
        analyticsProps: {
          'Campaign Name': data.campaignName,
          'User Action Type': UserActionType.VOTER_REGISTRATION,
          State: data.usaState,
        },
      },
      () =>
        actionCreateUserActionVoterRegistration(data).then(actionResult => {
          if (actionResult.user) {
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
    <UserActionFormVoterRegistrationLayout onBack={handleOnBack}>
      <UserActionFormVoterRegistrationLayout.Container>
        <UserActionFormVoterRegistrationLayout.Heading title="Claim “I'm a Voter” NFT" />
        <div className="flex w-full flex-col items-center gap-8 md:flex-row">
          <NextImage
            alt={I_AM_A_VOTER_NFT_IMAGE.alt}
            height={I_AM_A_VOTER_NFT_IMAGE.height}
            src={I_AM_A_VOTER_NFT_IMAGE.url}
            width={I_AM_A_VOTER_NFT_IMAGE.width}
          />
          <p className="text-fontcolor-muted">
            The “I'm a Voter” NFT was created by{' '}
            <ExternalLink className="text-fontcolor underline" href="https://pplplsr.com/About">
              pplpleasr
            </ExternalLink>
            , in parternship with Stand with Crytpo, to highlight the power of the crypto community
            to mobilize and vote in the 2024 elections.
            <br /> <br /> Limited to one mint per person.
          </p>
        </div>
      </UserActionFormVoterRegistrationLayout.Container>
      <UserActionFormVoterRegistrationLayout.Footer>
        <Button disabled={loading} onClick={handleClaimNft} size="lg">
          Claim NFT
        </Button>
      </UserActionFormVoterRegistrationLayout.Footer>
    </UserActionFormVoterRegistrationLayout>
  )
}
