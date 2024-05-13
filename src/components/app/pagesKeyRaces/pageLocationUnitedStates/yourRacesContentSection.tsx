'use client'

import React from 'react'

import { ContentSectionWithVariableSubtitleByAddress } from '@/components/app/pagesKeyRaces/common/contentSectionWithVariableSubtitleByAddress'
import { UserAddressVoterGuideInput } from '@/components/app/pagesKeyRaces/pageLocationUnitedStates/userAddressVoterGuideInput'
import { SupportedLocale } from '@/intl/locales'

export function YourRacesContentSection({ locale }: { locale: SupportedLocale }) {
  return (
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
  )
}
