import { SectionNames } from '@/components/app/userActionFormVoterRegistrationNft/constants'
import { UserActionFormVoterRegistrationNftLayout } from '@/components/app/userActionFormVoterRegistrationNft/sections/layout'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'

interface ClaimNftProps extends UseSectionsReturn<SectionNames> {}

export function ClaimNft({ goToSection }: ClaimNftProps) {
  return (
    <UserActionFormVoterRegistrationNftLayout onBack={() => goToSection(SectionNames.SURVEY)}>
      <UserActionFormVoterRegistrationNftLayout.Container>
        <UserActionFormVoterRegistrationNftLayout.Heading
          title="Get your “I Registered” NFT"
          subtitle='You can get get a free "I Registered" NFT'
        />
      </UserActionFormVoterRegistrationNftLayout.Container>
      <UserActionFormVoterRegistrationNftLayout.Footer>
        <Button onClick={() => goToSection(SectionNames.SUCCESS)}>Claim NFT</Button>
      </UserActionFormVoterRegistrationNftLayout.Footer>
    </UserActionFormVoterRegistrationNftLayout>
  )
}
