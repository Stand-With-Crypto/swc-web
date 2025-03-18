'use client'

import { getUserActionTweetContentByCountry } from '@/components/app/userActionFormShareOnTwitter/common/getUserActionContentByCountry'
import { useSections } from '@/hooks/useSections'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export type UserActionFormShareOnTwitterProps = {
  onClose: () => void
  countryCode: SupportedCountryCodes
}

export function UserActionFormShareOnTwitter(props: UserActionFormShareOnTwitterProps) {
  const { onClose, countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE } = props

  const countryConfig = getUserActionTweetContentByCountry(countryCode)

  const sectionProps = useSections({
    sections: countryConfig.sections,
    initialSectionId: countryConfig.initialSection,
    analyticsName: countryConfig.analyticsName,
  })

  const currentSectionId = sectionProps.currentSection
  const SectionComponent = countryConfig.sectionComponents[currentSectionId]

  if (!SectionComponent) {
    sectionProps.onSectionNotFound()
    return null
  }

  return <SectionComponent {...sectionProps} countryCode={countryCode} onClose={onClose} />
}
