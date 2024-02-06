'use client'
import { PrivacyPolicyDialog } from '@/components/app/pagePrivacyPolicy/dialog'
import { SectionNames } from '@/components/app/userActionFormVoterRegistrationNft/constants'
import { UserActionFormVoterRegistrationNftLayout } from '@/components/app/userActionFormVoterRegistrationNft/sections/layout'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'

interface SurveyProps extends UseSectionsReturn<SectionNames> {}

export function Survey({ goToSection }: SurveyProps) {
  return (
    <UserActionFormVoterRegistrationNftLayout>
      <UserActionFormVoterRegistrationNftLayout.Container>
        <UserActionFormVoterRegistrationNftLayout.Heading
          title="Are you registered to vote?"
          subtitle='Register to vote or check your voter registration and get a free "I Registered" NFT'
        />
        <div className="flex flex-col content-center items-center gap-3 lg:flex-row">
          <Button
            onClick={() => goToSection(SectionNames.CLAIM_NFT)}
            variant="secondary"
            className="w-[190px]"
          >
            Yes
          </Button>
          <Button
            onClick={() => goToSection(SectionNames.VOTER_REGISTRATION_FORM)}
            variant="secondary"
            className="w-[190px]"
          >
            No
          </Button>
          <Button
            onClick={() => goToSection(SectionNames.CHECK_REGISTRATION_FORM)}
            variant="secondary"
            className="w-[190px]"
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
      </UserActionFormVoterRegistrationNftLayout.Container>
    </UserActionFormVoterRegistrationNftLayout>
  )
}
