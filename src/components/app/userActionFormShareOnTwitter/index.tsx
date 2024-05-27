'use client'

import { ShareOnX } from '@/components/app/userActionFormShareOnTwitter/sections/share'
import { UserActionFormShareOnTwitterSuccess } from '@/components/app/userActionFormShareOnTwitter/sections/success'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { useSections } from '@/hooks/useSections'
import { getValues } from '@/utils/shared/getEntries'

import { ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER, SECTIONS_NAMES } from './constants'

interface UserActionFormShareOnTwitterProps {
  onClose: () => void
}

export function UserActionFormShareOnTwitter(props: UserActionFormShareOnTwitterProps) {
  const { onClose } = props

  const sectionProps = useSections({
    sections: getValues(SECTIONS_NAMES),
    initialSectionId: SECTIONS_NAMES.SHARE,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  })

  switch (sectionProps.currentSection) {
    case SECTIONS_NAMES.SHARE:
      return <ShareOnX {...sectionProps} />
    case SECTIONS_NAMES.SUCCESS:
      return (
        <UserActionFormSuccessScreen onClose={onClose}>
          <UserActionFormShareOnTwitterSuccess />
        </UserActionFormSuccessScreen>
      )
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
