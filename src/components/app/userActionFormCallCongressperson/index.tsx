import React from 'react'
import * as Sentry from '@sentry/nextjs'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { useTabs, useTabsContext } from '@/hooks/useTabs'
import { GoogleCivicInfoResponse } from '@/utils/shared/googleCivicInfo'
import { DTSIPeopleByCongressionalDistrictQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'

import { TabNames } from './userActionFormCallCongressperson.types'
import { Intro } from './tabs/intro'
import { Address } from './tabs/address'
import { SuggestedScript } from './tabs/suggestedScript'
import { SuccessMessage } from './tabs/successMessage'
import { z } from 'zod'
import { zodAddress } from '@/validation/fields/zodAddress'

interface OnFindCongressPersonPayload {
  dtsiPerson: DTSIPeopleByCongressionalDistrictQueryResult
  civicData: GoogleCivicInfoResponse
  addressSchema: z.infer<typeof zodAddress>
}

export interface UserActionFormCallCongresspersonProps {
  user: GetUserFullProfileInfoResponse['user']
  onFindCongressperson: (payload: OnFindCongressPersonPayload) => void
  congressPersonData: OnFindCongressPersonPayload
}

export function UserActionFormCallCongressperson({
  user,
}: {
  user: GetUserFullProfileInfoResponse['user']
}) {
  const { TabsProvider } = useTabs<TabNames>({
    tabs: Object.values(TabNames),
    initialTabId: TabNames.INTRO,
  })

  const [congressPersonData, setCongresspersonData] = React.useState<OnFindCongressPersonPayload>()

  return (
    <TabsProvider>
      <TabContent
        user={user}
        onFindCongressperson={setCongresspersonData}
        congressPersonData={congressPersonData}
      />
    </TabsProvider>
  )
}

type TabContentProps = Pick<
  UserActionFormCallCongresspersonProps,
  'user' | 'onFindCongressperson'
> & {
  congressPersonData?: UserActionFormCallCongresspersonProps['congressPersonData']
}

function TabContent({ user, congressPersonData, onFindCongressperson }: TabContentProps) {
  const { currentTab, onTabNotFound } = useTabsContext<TabNames>()

  // console.log({ congressPersonData })

  switch (currentTab) {
    case TabNames.INTRO:
      return <Intro />
    case TabNames.ADDRESS:
      return (
        <Address
          user={user}
          onFindCongressperson={onFindCongressperson}
          congressPersonData={congressPersonData}
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

      return <SuggestedScript user={user} congressPersonData={congressPersonData} />
    case TabNames.SUCCESS_MESSAGE:
      return <SuccessMessage />
    default:
      onTabNotFound()
      return null
  }
}
