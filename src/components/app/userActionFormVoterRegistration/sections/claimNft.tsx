import { SectionNames } from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationLayout } from '@/components/app/userActionFormVoterRegistration/sections/layout'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'

interface ClaimNftProps extends UseSectionsReturn<SectionNames> {}

export function ClaimNft({ goToSection }: ClaimNftProps) {
  return (
    <UserActionFormVoterRegistrationLayout onBack={() => goToSection(SectionNames.SURVEY)}>
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
}
