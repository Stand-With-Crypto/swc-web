'use client'

import { SectionNames } from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationLayout } from '@/components/app/userActionFormVoterRegistration/sections/layout'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'
import { memo, useCallback } from 'react'

interface ClaimNftProps extends UseSectionsReturn<SectionNames> {}

export const ClaimNft = memo(function ClaimNft({ goToSection }: ClaimNftProps) {
  const handleOnBack = useCallback(() => {
    goToSection(SectionNames.SURVEY)
  }, [goToSection])

  return (
    <UserActionFormVoterRegistrationLayout onBack={() => handleOnBack}>
      <UserActionFormVoterRegistrationLayout.Container>
        <UserActionFormVoterRegistrationLayout.Heading
          title="Get your “I Registered” NFT"
          subtitle='You can get get a free "I Registered" NFT'
        />
      </UserActionFormVoterRegistrationLayout.Container>
      <UserActionFormVoterRegistrationLayout.Footer>
        <Button size="lg" onClick={() => goToSection(SectionNames.SUCCESS)}>
          Claim NFT
        </Button>
      </UserActionFormVoterRegistrationLayout.Footer>
    </UserActionFormVoterRegistrationLayout>
  )
})
