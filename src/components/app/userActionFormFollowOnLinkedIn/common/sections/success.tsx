'use client'
import { UserActionType } from '@prisma/client'

import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { getUserActionFormSuccessScreenInfo } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export function SuccessSection({
  onClose,
  countryCode,
  language = SupportedLanguages.EN,
}: {
  onClose: () => void
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}) {
  const info = getUserActionFormSuccessScreenInfo({
    actionType: UserActionType.LINKEDIN,
    countryCode,
    language,
  })

  return (
    <UserActionFormSuccessScreen onClose={onClose}>
      <UserActionFormSuccessScreenFeedback {...info} />
    </UserActionFormSuccessScreen>
  )
}
