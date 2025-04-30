import * as Sentry from '@sentry/nextjs'

import {
  SendgridCustomField,
  SendgridReservedField,
} from '@/utils/server/sendgrid/marketing/customFields'
import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type CountryDisplayNames =
  (typeof COUNTRY_CODE_TO_DISPLAY_NAME)[keyof typeof COUNTRY_CODE_TO_DISPLAY_NAME]
export type SendgridContactListName = `${CountryDisplayNames} Contacts`

export const getSendgridContactListName = (
  countryCode: SupportedCountryCodes,
): SendgridContactListName => {
  return `${COUNTRY_CODE_TO_DISPLAY_NAME[countryCode as SupportedCountryCodes]} Contacts`
}

export type SendgridContact = Record<SendgridReservedField, string> & {
  custom_fields: Record<SendgridCustomField, string>
}

interface GetListsResponse {
  result: {
    id: string
    name: string
    contact_count: number
  }[]
}

interface CreateListResponse {
  id: string
  name: string
  contact_count: number
}

export const getSendgridContactList = async (name: SendgridContactListName) => {
  try {
    const [listsResponse] = await SendgridClient.request({
      url: `/v3/marketing/lists`,
      method: 'GET',
    })
    const lists = (listsResponse.body as GetListsResponse).result
    const existingList = lists.find(list => list.name === name)
    if (existingList) {
      return existingList
    }

    const [createResponse] = await SendgridClient.request({
      url: '/v3/marketing/lists',
      method: 'POST',
      body: {
        name: name,
      },
    })
    const newList = createResponse.body as CreateListResponse
    return newList
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        domain: 'sendgridClient.lists.getOrCreateList',
      },
    })
    throw error
  }
}
