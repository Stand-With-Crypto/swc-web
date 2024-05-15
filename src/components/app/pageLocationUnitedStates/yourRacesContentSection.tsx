'use client'

import React, { Suspense } from 'react'

import { UserAddressVoterGuideInput } from '@/components/app/pageLocationUnitedStates/userAddressVoterGuideInput'
import { ContentSectionWithVariableSubtitleByAddress } from '@/components/app/pagesKeyRacesCommon/contentSectionWithVariableSubtitleByAddress'
import { SupportedLocale } from '@/intl/locales'

export function YourRacesContentSection({ locale }: { locale: SupportedLocale }) {
  return (
    <Suspense>
      <ContentSectionWithVariableSubtitleByAddress
        className="container"
        renderContent={({ onChangeAddress }) => (
          <UserAddressVoterGuideInput locale={locale} onChange={onChangeAddress} />
        )}
        subtitle={
          'Enter your address to find the key races in your area that will impact the future of crypto in the United States.'
        }
        title={'Your races'}
        withAddress="hidden"
        withoutAddress="visible"
      />
    </Suspense>
  )
}
