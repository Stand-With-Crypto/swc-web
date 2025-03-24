import { useMemo, useState } from 'react'

import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION,
  RegistrationStatusAnswer,
  SectionNames,
} from '@/components/app/userActionFormVoterRegistration/constants'
import { UserActionFormVoterRegistrationSuccess } from '@/components/app/userActionFormVoterRegistration/sections/success'
import { Survey } from '@/components/app/userActionFormVoterRegistration/sections/survey'
import { VoterRegistrationForm } from '@/components/app/userActionFormVoterRegistration/sections/voterRegistrationForm'
import { useSections } from '@/hooks/useSections'
import { USStateCode } from '@/utils/shared/usStateUtils'

export function UserActionFormVoterRegistration({
  onClose,
  initialStateCode,
}: {
  onClose: () => void
  initialStateCode?: USStateCode
}) {
  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.SURVEY,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound, goToSection } = sectionProps

  const [stateCode, setStateCode] = useState<USStateCode | undefined>(initialStateCode)
  const [registrationStatusAnswer, setRegistrationStatusAnswer] =
    useState<RegistrationStatusAnswer | null>(null)

  const content = useMemo(() => {
    switch (currentTab) {
      case SectionNames.SURVEY:
        return (
          <Survey
            onAnswer={answer => {
              setRegistrationStatusAnswer(answer)
              goToSection(SectionNames.VOTER_REGISTRATION_FORM)
            }}
          />
        )
      case SectionNames.VOTER_REGISTRATION_FORM:
        if (!registrationStatusAnswer) {
          onTabNotFound()
          return null
        }

        return (
          <VoterRegistrationForm
            onChangeStateCode={setStateCode}
            registrationAnswer={registrationStatusAnswer}
            stateCode={stateCode}
            {...sectionProps}
          />
        )
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
  }, [
    currentTab,
    goToSection,
    onClose,
    onTabNotFound,
    registrationStatusAnswer,
    sectionProps,
    stateCode,
  ])

  return content
}
