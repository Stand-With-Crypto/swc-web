'use client'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { getUserActionFormSuccessScreenInfo } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { UserActionType } from '@prisma/client'

export function SuccessSection({
  onClose,
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
  language = SupportedLanguages.EN,
}: {
  onClose: () => void
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}) {
  const info = getUserActionFormSuccessScreenInfo({
    actionType: UserActionType.TWEET,
    countryCode,
    language,
  })

  return (
    <UserActionFormSuccessScreen onClose={onClose}>
      <UserActionFormSuccessScreenFeedback {...info} />
    </UserActionFormSuccessScreen>
  )
}
