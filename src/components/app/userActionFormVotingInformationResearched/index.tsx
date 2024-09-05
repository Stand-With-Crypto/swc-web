import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTING_INFORMATION_RESEARCHED,
  SECTIONS_NAMES,
} from '@/components/app/userActionFormVotingInformationResearched/constants'
import { UserActionFormVotingInformationResearchedSuccess } from '@/components/app/userActionFormVotingInformationResearched/sections/success'
import { useSections } from '@/hooks/useSections'

import { Address } from './sections/address'
import { VotingInformationResearchedFormValues } from './formConfig'

export interface UserActionFormVotingInformationResearchedProps {
  onSuccess: () => void
  initialValues?: Partial<VotingInformationResearchedFormValues>
}

export const UserActionFormVotingInformationResearched = (
  props: UserActionFormVotingInformationResearchedProps,
) => {
  const { onSuccess, initialValues } = props

  const sectionProps = useSections({
    sections: Object.values(SECTIONS_NAMES),
    initialSectionId: SECTIONS_NAMES.ADDRESS,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTING_INFORMATION_RESEARCHED,
  })

  switch (sectionProps.currentSection) {
    case SECTIONS_NAMES.ADDRESS:
      return (
        <Address
          initialValues={initialValues}
          onSuccess={() => sectionProps.goToSection(SECTIONS_NAMES.SUCCESS)}
        />
      )
    case SECTIONS_NAMES.SUCCESS:
      return (
        <UserActionFormSuccessScreen onClose={onSuccess}>
          <UserActionFormVotingInformationResearchedSuccess />
        </UserActionFormSuccessScreen>
      )
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
