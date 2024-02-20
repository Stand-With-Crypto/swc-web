'use client'

import { useCallback } from 'react'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'

import {
  actionCreateUserActionVoterRegistration,
  CreateActionVoterRegistrationInput,
} from '@/actions/actionCreateUserActionVoterRegistration'
import { SectionNames } from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationLayout } from '@/components/app/userActionFormVoterRegistration/sections/layout'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { UseSectionsReturn } from '@/hooks/useSections'
import { UserActionVoterRegistrationCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'
import { toastGenericError } from '@/utils/web/toastUtils'

interface ClaimNftProps extends UseSectionsReturn<SectionNames> {}

export function ClaimNft({ goToSection }: ClaimNftProps) {
  const router = useRouter()

  const handleOnBack = useCallback(() => {
    goToSection(SectionNames.SURVEY)
  }, [goToSection])

  const handleClaimNft = useCallback(async () => {
    const data: CreateActionVoterRegistrationInput = {
      campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
      usaState: undefined,
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
  }, [goToSection, router])

  return (
    <UserActionFormVoterRegistrationLayout onBack={handleOnBack}>
      <UserActionFormVoterRegistrationLayout.Container>
        <UserActionFormVoterRegistrationLayout.Heading
          subtitle=""
          title={`Claim "I'm a Voter" NFT`}
        />
        <div className="flex flex-row gap-8">
          <NextImage
            alt={NFT_CLIENT_METADATA['i-am-a-voter'].image.alt}
            height={NFT_CLIENT_METADATA['i-am-a-voter'].image.height}
            src={NFT_CLIENT_METADATA['i-am-a-voter'].image.url}
            width={NFT_CLIENT_METADATA['i-am-a-voter'].image.width}
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
        <Button onClick={handleClaimNft} size="lg">
          Claim NFT
        </Button>
      </UserActionFormVoterRegistrationLayout.Footer>
    </UserActionFormVoterRegistrationLayout>
  )
}
