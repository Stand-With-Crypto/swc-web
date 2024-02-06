'use client'
import { PrivacyPolicyDialog } from '@/components/app/pagePrivacyPolicy/dialog'
import { SectionNames } from '@/components/app/userActionFormVoterRegistrationNft/constants'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { UseSectionsReturn } from '@/hooks/useSections'

interface SurveyProps extends UseSectionsReturn<SectionNames> {}

export function Survey({ goToSection }: SurveyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-24">
      <div className="flex flex-col gap-4">
        <PageTitle size="md">Are you registered to vote?</PageTitle>
        <PageSubTitle>
          Register to vote or check your voter registration and get a free "I Registered" NFT
        </PageSubTitle>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
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
      <p>
        Personal information subject to{' '}
        <PrivacyPolicyDialog>
          <span className="cursor-pointer text-blue-600">Stand with Crypto Privacy Policy</span>
        </PrivacyPolicyDialog>
        .
      </p>
    </div>
  )
}
