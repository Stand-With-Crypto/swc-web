import * as Sentry from '@sentry/nextjs'

import {
  SendgridCustomField,
  SendgridField,
  SendgridReservedField,
} from '@/utils/server/sendgrid/marketing/constants'
import { formatContactCustomFields } from '@/utils/server/sendgrid/marketing/formatContact'
import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'

export type SendgridContact = Record<SendgridReservedField, string> & {
  custom_fields: Record<SendgridCustomField, string | number>
}

interface Options {
  listIds: string[]
  customFieldsMap: Record<SendgridField, string | null>
}

interface AddContactsResponse {
  body: {
    job_id: string
  }
}

export const upsertSendgridContactsArray = async (
  contacts: SendgridContact[],
  options: Options,
) => {
  const { listIds, customFieldsMap } = options

  const formattedContacts = contacts.map(contact =>
    formatContactCustomFields(contact, customFieldsMap),
  )

  try {
    const [response] = (await SendgridClient.request({
      url: '/v3/marketing/contacts',
      method: 'PUT',
      body: {
        list_ids: listIds,
        contacts: formattedContacts,
      },
    })) as [AddContactsResponse, unknown]
    return response.body
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        domain: 'SendgridMarketing',
      },
      extra: {
        contacts: contacts.slice(0, 3),
        options,
      },
    })

    throw error
  }
}
