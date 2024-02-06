import { SectionNames } from '@/components/app/userActionFormVoterRegistrationNft/constants'
import { UseSectionsReturn } from '@/hooks/useSections'

interface ClaimNftProps extends UseSectionsReturn<SectionNames> {}

export function ClaimNft({ goToSection }: ClaimNftProps) {
  return (
    <div className="flex flex-col">
      TODO: Claim NFT
      <button onClick={() => goToSection(SectionNames.SUCCESS)}>Go to success</button>
    </div>
  )
}
