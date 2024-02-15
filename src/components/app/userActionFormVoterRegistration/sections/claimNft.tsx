'use client'

import { useCallback } from 'react'

import { SectionNames } from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationLayout } from '@/components/app/userActionFormVoterRegistration/sections/layout'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'

interface ClaimNftProps extends UseSectionsReturn<SectionNames> {}

export function ClaimNft({ goToSection }: ClaimNftProps) {
  const handleOnBack = useCallback(() => {
    goToSection(SectionNames.SURVEY)
  }, [goToSection])

  return (
    <UserActionFormVoterRegistrationLayout onBack={handleOnBack}>
      <UserActionFormVoterRegistrationLayout.Container>
        <UserActionFormVoterRegistrationLayout.Heading
          subtitle='You can get get a free "I Registered" NFT'
          title="Get your “I Registered” NFT"
        />
      </UserActionFormVoterRegistrationLayout.Container>
      <UserActionFormVoterRegistrationLayout.Footer>
        <Button onClick={() => goToSection(SectionNames.SUCCESS)} size="lg">
          Claim NFT
        </Button>
      </UserActionFormVoterRegistrationLayout.Footer>
    </UserActionFormVoterRegistrationLayout>
  )
}
