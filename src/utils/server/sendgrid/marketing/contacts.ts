import * as Sentry from '@sentry/nextjs'

import {
  SendgridCustomField,
  SendgridReservedField,
} from '@/utils/server/sendgrid/marketing/constants'
import { formatContactCustomFields } from '@/utils/server/sendgrid/marketing/formatContact'
import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'

export type SendgridContact = Record<SendgridReservedField, string> & {
  custom_fields: Record<SendgridCustomField, string | number>
}

interface Options {
  listIds: string[]
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
  const formattedContacts = contacts.map(formatContactCustomFields)

  try {
    const [response] = (await SendgridClient.request({
      url: '/v3/marketing/contacts',
      method: 'PUT',
      body: {
        list_ids: options.listIds,
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
