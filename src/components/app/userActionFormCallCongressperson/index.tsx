import React from 'react'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { Tab, useTabs } from '@/hooks/useTabs'
import { UseGetDTSIPeopleFromAddressResponse } from '@/hooks/useGetDTSIPeopleFromAddress'
import { GoogleCivicInfoResponse } from '@/utils/shared/googleCivicInfo'

import { TabNames } from './userActionFormCallCongressperson.types'
import { Intro } from './tabs/intro'
import { Address } from './tabs/address'
import { SuggestedScript } from './tabs/suggestedScript'
import { SuccessMessage } from './tabs/successMessage'

const TABS: Tab<UserActionFormCallCongresspersonTabsContext>[] = [
  {
    id: TabNames.INTRO,
    component: Intro,
  },
  {
    id: TabNames.ADDRESS,
    component: Address,
  },
  {
    id: TabNames.SUGGESTED_SCRIPT,
    component: SuggestedScript,
  },
  {
    id: TabNames.SUCCESS_MESSAGE,
    component: SuccessMessage,
  },
]

interface OnFindCongressPersonPayload {
  dtsiPerson: UseGetDTSIPeopleFromAddressResponse
  civicData: GoogleCivicInfoResponse
}

export interface UserActionFormCallCongresspersonTabsContext {
  user: GetUserFullProfileInfoResponse['user']
  onFindCongressperson: (payload: OnFindCongressPersonPayload) => void
  congressPersonData?: OnFindCongressPersonPayload
}

export function UserActionFormCallCongressperson({
  user,
}: {
  user: GetUserFullProfileInfoResponse['user']
}) {
  const [congressPersonData, setCongresspersonData] = React.useState<OnFindCongressPersonPayload>()

  const { component } = useTabs<UserActionFormCallCongresspersonTabsContext>({
    tabs: TABS,
    initialTabId: TabNames.INTRO,
    tabAdditionalContext: {
      user,
      onFindCongressperson: setCongresspersonData,
      congressPersonData,
    },
  })

  return <>{component}</>
}
