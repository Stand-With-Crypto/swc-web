import * as Sentry from '@sentry/nextjs'
import React from 'react'
import { z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { DTSIPeopleByCongressionalDistrictQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'
import { UseSectionsReturn, useSections } from '@/hooks/useSections'
import { GoogleCivicInfoResponse } from '@/utils/shared/googleCivicInfo'
import { zodAddress } from '@/validation/fields/zodAddress'

import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { Address } from './tabs/address'
import { Intro } from './tabs/intro'
import { SuggestedScript } from './tabs/suggestedScript'
import { ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON, SectionNames } from './constants'

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
}: {
  user: GetUserFullProfileInfoResponse['user']
  onClose: () => void
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
      return <UserActionFormSuccessScreen onClose={onClose} />
    default:
      onTabNotFound()
      return null
  }
}
