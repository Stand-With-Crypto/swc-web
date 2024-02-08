'use client'
import { PrivacyPolicyDialog } from '@/components/app/pagePrivacyPolicy/dialog'
import { SectionNames } from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationLayout } from '@/components/app/userActionFormVoterRegistration/sections/layout'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'
import { memo, useCallback } from 'react'

interface SurveyProps extends UseSectionsReturn<SectionNames> {}

export const Survey = memo(function Survey({ goToSection }: SurveyProps) {
  const createSelectionHandler = useCallback(
    (step: SectionNames) => {
      return () => {
        goToSection(step)
      }
    },
    [goToSection],
  )

  return (
    <UserActionFormVoterRegistrationLayout>
      <UserActionFormVoterRegistrationLayout.Container>
        <div className="flex flex-col gap-24">
          <UserActionFormVoterRegistrationLayout.Heading
            title="Are you registered to vote?"
            subtitle='Register to vote or check your voter registration and get a free "I Registered" NFT'
          />
          <div className="flex flex-grow flex-col items-center justify-center gap-3 lg:flex-row">
            <Button
              onClick={createSelectionHandler(SectionNames.CLAIM_NFT)}
              variant="secondary"
              size="lg"
              className="w-full lg:w-auto"
            >
              Yes
            </Button>
            <Button
              onClick={createSelectionHandler(SectionNames.VOTER_REGISTRATION_FORM)}
              variant="secondary"
              size="lg"
              className="w-full lg:w-auto"
            >
              No
            </Button>
            <Button
              onClick={createSelectionHandler(SectionNames.CHECK_REGISTRATION_FORM)}
              variant="secondary"
              size="lg"
              className="w-full lg:w-auto"
            >
              I’m not sure
            </Button>
          </div>
          <p className="text-center">
            Personal information subject to{' '}
            <PrivacyPolicyDialog>
              <span className="cursor-pointer text-blue-600">Stand with Crypto Privacy Policy</span>
            </PrivacyPolicyDialog>
            .
          </p>
        </div>
      </UserActionFormVoterRegistrationLayout.Container>
    </UserActionFormVoterRegistrationLayout>
  )
})
