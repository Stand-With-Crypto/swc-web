import { SectionNames } from '@/components/app/userActionFormVoterRegistrationNft/constants'
import { UseSectionsReturn } from '@/hooks/useSections'

interface VoterRegistrationFormProps extends UseSectionsReturn<SectionNames> {}

export function VoterRegistrationForm({ goToSection }: VoterRegistrationFormProps) {
  return (
    <div className="flex flex-col">
      TODO: Voter Registration Form
      <button onClick={() => goToSection(SectionNames.CLAIM_NFT)}>Go to claim nft</button>
    </div>
  )
}
