import * as Sentry from '@sentry/nextjs'

import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'
import { COUNTRY_CODE_TO_DISPLAY_NAME, CountryDisplayName } from '@/utils/shared/intl/displayNames'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type SendgridContactListName = `${CountryDisplayName} Advocates`
export const getSendgridContactListName = (
  countryCode: SupportedCountryCodes,
): SendgridContactListName => {
  return `${COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]} Advocates`
}

interface SendgridContactList {
  id: string
  name: string
  contact_count: number
}

interface GetListsResponse {
  body: {
    result: SendgridContactList[]
  }
}

interface CreateListResponse {
  body: SendgridContactList
}

export const fetchSendgridContactList = async (listName: SendgridContactListName) => {
  try {
    const [listsResponse] = (await SendgridClient.request({
      url: `/v3/marketing/lists`,
      method: 'GET',
    })) as [GetListsResponse, unknown]
    const lists = listsResponse.body.result
    const existingList = lists.find(list => list.name === listName)
    if (existingList) {
      return existingList
    }

    const [createResponse] = (await SendgridClient.request({
      url: '/v3/marketing/lists',
      method: 'POST',
      body: {
        name: listName,
      },
    })) as [CreateListResponse, unknown]
    return createResponse.body
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        domain: 'SendgridMarketing',
      },
      extra: {
        listName,
      },
    })
    throw error
  }
}
