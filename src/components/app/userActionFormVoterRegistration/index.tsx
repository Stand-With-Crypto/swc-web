import { useMemo, useState } from 'react'

import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION,
  SectionNames,
} from '@/components/app/userActionFormVoterRegistration/constants'
import { ClaimNft } from '@/components/app/userActionFormVoterRegistration/sections/claimNft'
import { UserActionFormVoterRegistrationSuccess } from '@/components/app/userActionFormVoterRegistration/sections/success'
import { Survey } from '@/components/app/userActionFormVoterRegistration/sections/survey'
import { VoterRegistrationForm } from '@/components/app/userActionFormVoterRegistration/sections/voterRegistrationForm'
import { useSections } from '@/hooks/useSections'
import { NFTSlug } from '@/utils/shared/nft'
import { USStateCode } from '@/utils/shared/usStateUtils'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

export function UserActionFormVoterRegistration({
  onClose,
  initialStateCode,
}: {
  onClose: () => void
  initialStateCode?: USStateCode
}) {
  const sectionProps = useSections<SectionNames>({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.SURVEY,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  const [stateCode, setStateCode] = useState<USStateCode | undefined>(initialStateCode)

  const content = useMemo(() => {
    switch (currentTab) {
      case SectionNames.SURVEY:
        return <Survey {...sectionProps} />
      case SectionNames.VOTER_REGISTRATION_FORM:
        return (
          <VoterRegistrationForm
            setStateCode={setStateCode}
            stateCode={stateCode}
            {...sectionProps}
          />
        )
      case SectionNames.CHECK_REGISTRATION_FORM:
        return (
          <VoterRegistrationForm
            checkRegistration
            setStateCode={setStateCode}
            stateCode={stateCode}
            {...sectionProps}
          />
        )
      case SectionNames.CLAIM_NFT:
        return <ClaimNft stateCode={stateCode} {...sectionProps} />
      case SectionNames.ACCOUNT_REGISTRATION:
        return null
      case SectionNames.SUCCESS:
        return (
          <UserActionFormSuccessScreen onClose={onClose}>
            <UserActionFormVoterRegistrationSuccess />
          </UserActionFormSuccessScreen>
        )
      default:
        onTabNotFound()
        return null
    }
  }, [currentTab, onClose, onTabNotFound, sectionProps, stateCode])

  return content
}
