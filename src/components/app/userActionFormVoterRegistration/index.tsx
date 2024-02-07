import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION,
  SectionNames,
} from '@/components/app/userActionFormVoterRegistration/constants'
import { ClaimNft } from '@/components/app/userActionFormVoterRegistration/sections/claimNft'
import { ClaimNftSuccess } from '@/components/app/userActionFormVoterRegistration/sections/claimNftSuccess'
import { Survey } from '@/components/app/userActionFormVoterRegistration/sections/survey'
import { VoterRegistrationForm } from '@/components/app/userActionFormVoterRegistration/sections/voterRegistrationForm'
import { useSections } from '@/hooks/useSections'
import { useMemo } from 'react'

export function UserActionFormVoterRegistration() {
  const sectionProps = useSections<SectionNames>({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.SURVEY,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION,
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
        return <ClaimNftSuccess {...sectionProps} />
      default:
        onTabNotFound()
        return null
    }
  }, [currentTab, onTabNotFound, sectionProps])

  return content
}
