import { SectionNames } from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationLayout } from '@/components/app/userActionFormVoterRegistration/sections/layout'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { UseSectionsReturn } from '@/hooks/useSections'

interface ClaimNftSuccessProps extends UseSectionsReturn<SectionNames> {}

export function ClaimNftSuccess({ goToSection }: ClaimNftSuccessProps) {
  return (
    <UserActionFormVoterRegistrationLayout
      onBack={() => goToSection(SectionNames.VOTER_REGISTRATION_FORM)}
    >
      <UserActionFormVoterRegistrationLayout.Container>
        <div className="flex flex-col items-center justify-center gap-8">
          <UserActionFormVoterRegistrationLayout.Heading
            title="Nice work!"
            subtitle="You're NFT is on the way. Share your activity and help others #standwithcrypto"
          />
          <Button variant="secondary" asChild>
            <ExternalLink href="">Share on Twitter/X</ExternalLink>
          </Button>
        </div>
      </UserActionFormVoterRegistrationLayout.Container>
    </UserActionFormVoterRegistrationLayout>
  )
}
