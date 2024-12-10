import { useMemo } from 'react'

import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import {
  ANALYTICS_NAME_USER_ACTION_VOTING_DAY,
  SectionNames,
} from '@/components/app/userActionVotingDay/constants'
import { DidYouVote } from '@/components/app/userActionVotingDay/sections/didYouVote'
import { UserActionIVotedSuccess } from '@/components/app/userActionVotingDay/sections/success'
import { useSections } from '@/hooks/useSections'

export function UserActionVotingDay({ onClose }: { onClose: () => void }) {
  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.DID_YOU_VOTE,
    analyticsName: ANALYTICS_NAME_USER_ACTION_VOTING_DAY,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound, goToSection } = sectionProps

  const content = useMemo(() => {
    switch (currentTab) {
      case SectionNames.DID_YOU_VOTE:
        return (
          <DidYouVote
            onAnswer={() => {
              goToSection(SectionNames.SUCCESS)
            }}
          />
        )
      case SectionNames.SUCCESS:
        return (
          <UserActionFormSuccessScreen onClose={onClose}>
            <UserActionIVotedSuccess />
          </UserActionFormSuccessScreen>
        )
      default:
        onTabNotFound()
        return null
    }
  }, [currentTab, goToSection, onClose, onTabNotFound])

  return content
}
