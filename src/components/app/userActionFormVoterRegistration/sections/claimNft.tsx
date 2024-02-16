'use client'

import { useCallback } from 'react'

import { SectionNames } from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationLayout } from '@/components/app/userActionFormVoterRegistration/sections/layout'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { UseSectionsReturn } from '@/hooks/useSections'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

interface ClaimNftProps extends UseSectionsReturn<SectionNames> {}

export function ClaimNft({ goToSection }: ClaimNftProps) {
  const handleOnBack = useCallback(() => {
    goToSection(SectionNames.SURVEY)
  }, [goToSection])

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
        <Button onClick={() => goToSection(SectionNames.SUCCESS)} size="lg">
          Claim NFT
        </Button>
      </UserActionFormVoterRegistrationLayout.Footer>
    </UserActionFormVoterRegistrationLayout>
  )
}
