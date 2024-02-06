import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION_NFT,
  SectionNames,
} from '@/components/app/userActionFormVoterRegistrationNft/constants'
import { ClaimNft } from '@/components/app/userActionFormVoterRegistrationNft/sections/claimNft'
import { Survey } from '@/components/app/userActionFormVoterRegistrationNft/sections/survey'
import { VoterRegistrationForm } from '@/components/app/userActionFormVoterRegistrationNft/sections/voterRegistrationForm'
import { useSections } from '@/hooks/useSections'
import { useMemo } from 'react'

export function UserActionFormVoterRegistrationNft({ onClose }: { onClose: () => void }) {
  const sectionProps = useSections<SectionNames>({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.SURVEY,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION_NFT,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  const content = useMemo(() => {
    switch (currentTab) {
      case SectionNames.SURVEY:
        return <Survey {...sectionProps} />
      case SectionNames.VOTER_REGISTRATION_FORM:
        return <VoterRegistrationForm {...sectionProps} />
      case SectionNames.CHECK_REGISTRATION_FORM:
        return <VoterRegistrationForm checkRegistration {...sectionProps} />
      case SectionNames.CLAIM_NFT:
        return <ClaimNft {...sectionProps} />
      case SectionNames.ACCOUNT_REGISTRATION:
        return null
      case SectionNames.SUCCESS:
        return (
          <div className="p-6">
            <UserActionFormSuccessScreen onClose={onClose} />
          </div>
        )
      default:
        onTabNotFound()
        return null
    }
  }, [currentTab, onClose, onTabNotFound, sectionProps])

  return content
}
