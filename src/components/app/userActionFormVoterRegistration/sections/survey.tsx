'use client'

import { useCallback } from 'react'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { RegistrationStatusAnswer } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { DialogBody, DialogFooterCTA } from '@/components/ui/dialog'
import { ExternalLink } from '@/components/ui/link'
import { useCountryCode } from '@/hooks/useCountryCode'
import { getIntlUrls } from '@/utils/shared/urls'

interface SurveyProps {
  onAnswer: (answer: RegistrationStatusAnswer) => void
}

export function Survey({ onAnswer }: SurveyProps) {
  const countryCode = useCountryCode()
  const urls = getIntlUrls(countryCode)
  const createAnswerHandler = useCallback(
    (answer: RegistrationStatusAnswer) => () => {
      onAnswer(answer)
    },
    [onAnswer],
  )

  return (
    <>
      <UserActionFormLayout>
        <UserActionFormLayout.Container>
          <DialogBody className="flex flex-col gap-24 lg:pb-8 lg:pt-6">
            <UserActionFormLayout.Heading
              subtitle="This year's election is critical for the future of crypto in America. Make sure you're able to vote in your state."
              title="Are you registered to vote?"
            />
            <div className="flex flex-grow flex-col items-center gap-3 lg:flex-row lg:justify-center">
              <Button
                className="w-full lg:w-auto"
                onClick={createAnswerHandler('yes')}
                size="lg"
                variant="secondary"
              >
                Yes
              </Button>
              <Button
                className="w-full lg:w-auto"
                onClick={createAnswerHandler('no')}
                size="lg"
                variant="secondary"
              >
                No
              </Button>
              <Button
                className="w-full lg:w-auto"
                onClick={createAnswerHandler('not-sure')}
                size="lg"
                variant="secondary"
              >
                I’m not sure
              </Button>
            </div>
            <DialogFooterCTA>
              <p className="text-center">
                Personal information subject to{' '}
                <ExternalLink
                  className="cursor-pointer hover:underline"
                  href={urls.privacyPolicy()}
                >
                  Stand With Crypto Privacy Policy
                </ExternalLink>
                .
              </p>
            </DialogFooterCTA>
          </DialogBody>
        </UserActionFormLayout.Container>
      </UserActionFormLayout>
    </>
  )
}
