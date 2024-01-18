import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { UseTabsReturn, useTabs } from '@/hooks/useTabs'
import { GoogleCivicInfoResponse } from '@/utils/shared/googleCivicInfo'
import { DTSIPeopleByCongressionalDistrictQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'
import { zodAddress } from '@/validation/fields/zodAddress'

import { TabNames } from './userActionFormCallCongressperson.types'
import { Intro } from './tabs/intro'
import { Address } from './tabs/address'
import { SuggestedScript } from './tabs/suggestedScript'
import { SuccessMessage } from './tabs/successMessage'

interface OnFindCongressPersonPayload {
  dtsiPerson: DTSIPeopleByCongressionalDistrictQueryResult
  civicData: GoogleCivicInfoResponse
  addressSchema: z.infer<typeof zodAddress>
}

export interface UserActionFormCallCongresspersonProps extends UseTabsReturn<TabNames> {
  user: GetUserFullProfileInfoResponse['user']
  onFindCongressperson: (payload: OnFindCongressPersonPayload) => void
  congressPersonData: OnFindCongressPersonPayload
}

export function UserActionFormCallCongressperson({
  user,
}: {
  user: GetUserFullProfileInfoResponse['user']
}) {
  const tabProps = useTabs<TabNames>({
    tabs: Object.values(TabNames),
    initialTabId: TabNames.INTRO,
  })
  const { currentTab, onTabNotFound } = tabProps

  const [congressPersonData, setCongresspersonData] = React.useState<OnFindCongressPersonPayload>()

  switch (currentTab) {
    case TabNames.INTRO:
      return <Intro {...tabProps} />
    case TabNames.ADDRESS:
      return (
        <Address
          user={user}
          onFindCongressperson={setCongresspersonData}
          congressPersonData={congressPersonData}
          {...tabProps}
        />
      )
    case TabNames.SUGGESTED_SCRIPT:
      // This should never happen in the normal tab flow, but if it does, we want to know about it
      if (!congressPersonData) {
        const err = new Error('Call Action - Missing congressPersonData')
        Sentry.captureException(err, {
          user: { id: user?.id },
        })
        throw err
      }

      return <SuggestedScript user={user} congressPersonData={congressPersonData} {...tabProps} />
    case TabNames.SUCCESS_MESSAGE:
      return <SuccessMessage />
    default:
      onTabNotFound()
      return null
  }
}
