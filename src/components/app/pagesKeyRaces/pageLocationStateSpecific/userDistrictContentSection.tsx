'use client'
import { Suspense } from 'react'

import { ContentSectionWithVariableSubtitleByAddress } from '@/components/app/pagesKeyRaces/common/contentSectionWithVariableSubtitleByAddress'
import { SupportedLocale } from '@/intl/locales'
import { USStateCode } from '@/utils/shared/usStateUtils'

import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'
import { UserLocationRaceInfo } from './userLocationRaceInfo'

interface UserDistrictContentSectionProps {
  stateName: string
  groups: ReturnType<typeof organizeStateSpecificPeople>
  locale: SupportedLocale
  stateCode: USStateCode
}

export function UserDistrictContentSection({
  groups,
  locale,
  stateName,
  stateCode,
}: UserDistrictContentSectionProps) {
  return (
    <Suspense>
      <ContentSectionWithVariableSubtitleByAddress
        className="bg-muted py-14"
        renderContent={({ onChangeAddress }) => (
          <UserLocationRaceInfo
            groups={groups}
            locale={locale}
            onChange={onChangeAddress}
            stateCode={stateCode}
          />
        )}
        subtitle={
          <>
            Do you live in {stateName}? Enter your address and we’ll redirect you to races in your
            district.
          </>
        }
        title={'Your district'}
        withAddress="hidden"
        withoutAddress="visible"
      />
    </Suspense>
  )
}
