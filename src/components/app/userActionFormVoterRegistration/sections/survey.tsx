'use client'
import { useCallback } from 'react'

import { SectionNames } from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationLayout } from '@/components/app/userActionFormVoterRegistration/sections/layout'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { useLocale } from '@/hooks/useLocale'
import { UseSectionsReturn } from '@/hooks/useSections'
import { getIntlUrls } from '@/utils/shared/urls'

interface SurveyProps extends UseSectionsReturn<SectionNames> {}

export function Survey({ goToSection }: SurveyProps) {
  const locale = useLocale()
  const urls = getIntlUrls(locale)
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
            subtitle="Register to vote or check your voter registration and get a free “I'm a Voter” NFT"
            title="Are you registered to vote?"
          />
          <div className="flex flex-grow flex-col items-center justify-center gap-3 lg:flex-row">
            <Button
              className="w-full lg:w-auto"
              onClick={createSelectionHandler(SectionNames.CLAIM_NFT)}
              size="lg"
              variant="secondary"
            >
              Yes
            </Button>
            <Button
              className="w-full lg:w-auto"
              onClick={createSelectionHandler(SectionNames.VOTER_REGISTRATION_FORM)}
              size="lg"
              variant="secondary"
            >
              No
            </Button>
            <Button
              className="w-full lg:w-auto"
              onClick={createSelectionHandler(SectionNames.CHECK_REGISTRATION_FORM)}
              size="lg"
              variant="secondary"
            >
              I’m not sure
            </Button>
          </div>
          <p className="text-center">
            Personal information subject to{' '}
            <ExternalLink
              className="cursor-pointer text-blue-600 hover:underline"
              href={urls.privacyPolicy()}
            >
              Stand With Crypto Privacy Policy
            </ExternalLink>
            .
          </p>
        </div>
      </UserActionFormVoterRegistrationLayout.Container>
    </UserActionFormVoterRegistrationLayout>
  )
}
