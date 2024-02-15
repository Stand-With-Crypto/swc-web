import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON,
  SectionNames,
} from '@/components/app/userActionFormCallCongressperson/constants'
import { FormFields } from '@/components/app/userActionFormCallCongressperson/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { DTSIPeopleByCongressionalDistrictQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'
import { useSections, UseSectionsReturn } from '@/hooks/useSections'
import { GoogleCivicInfoResponse } from '@/utils/shared/googleCivicInfo'
import { NFTSlug } from '@/utils/shared/nft'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'
import { zodAddress } from '@/validation/fields/zodAddress'

import { Address } from './sections/address'
import { Intro } from './sections/intro'
import { SuggestedScript } from './sections/suggestedScript'

interface OnFindCongressPersonPayload {
  dtsiPerson: DTSIPeopleByCongressionalDistrictQueryResult
  civicData: GoogleCivicInfoResponse
  addressSchema: z.infer<typeof zodAddress>
}

export interface UserActionFormCallCongresspersonProps extends UseSectionsReturn<SectionNames> {
  user: GetUserFullProfileInfoResponse['user']
  onFindCongressperson: (payload: OnFindCongressPersonPayload) => void
  congressPersonData: OnFindCongressPersonPayload
}

export function UserActionFormCallCongressperson({
  user,
  onClose,
  initialValues,
}: {
  user: GetUserFullProfileInfoResponse['user']
  onClose: () => void
  initialValues?: FormFields
}) {
  const sectionProps = useSections<SectionNames>({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.INTRO,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  const [congressPersonData, setCongresspersonData] = React.useState<OnFindCongressPersonPayload>()

  switch (currentTab) {
    case SectionNames.INTRO:
      return <Intro {...sectionProps} />
    case SectionNames.ADDRESS:
      return (
        <Address
          congressPersonData={congressPersonData}
          initialValues={initialValues}
          onFindCongressperson={setCongresspersonData}
          user={user}
          {...sectionProps}
        />
      )
    case SectionNames.SUGGESTED_SCRIPT:
      // This should never happen in the normal tab flow, but if it does, we want to know about it
      if (!congressPersonData) {
        const err = new Error('Call Action - Missing congressPersonData')
        Sentry.captureException(err, {
          user: { id: user?.id },
        })
        throw err
      }

      return (
        <SuggestedScript congressPersonData={congressPersonData} user={user} {...sectionProps} />
      )
    case SectionNames.SUCCESS_MESSAGE:
      return (
        <UserActionFormSuccessScreen
          nftWhenAuthenticated={NFT_CLIENT_METADATA[NFTSlug.CALL_REPRESENTATIVE_SEPT_11]}
          onClose={onClose}
        />
      )
    default:
      onTabNotFound()
      return null
  }
}
