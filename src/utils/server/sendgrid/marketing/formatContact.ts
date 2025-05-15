import * as Sentry from '@sentry/nextjs'

import { SendgridContact } from '@/utils/server/sendgrid/marketing/contacts'
import {
  fetchSendgridCustomFields,
  mapSendgridFieldToFieldIds,
} from '@/utils/server/sendgrid/marketing/customFields'

/**
 * Map custom fields to their respective Sendgrid ID.
 */
export async function formatContactCustomFields(contact: SendgridContact) {
  const sendgridFieldDefinitions = await fetchSendgridCustomFields()
  const fieldIds = mapSendgridFieldToFieldIds(sendgridFieldDefinitions)

  const { custom_fields, ...standardFields } = contact
  const customFieldsMappedToIds: Record<string, string | number> = {}

  typedObjectEntries(custom_fields).forEach(([fieldName, fieldValue]) => {
    const fieldId = fieldIds[fieldName]
    if (fieldId) {
      customFieldsMappedToIds[fieldId] = fieldValue
    } else {
      Sentry.captureMessage(`Custom field ${fieldName} not found in SendGrid definitions`, {
        tags: {
          domain: 'SendgridMarketing',
        },
        extra: {
          fieldName,
          fieldValue,
          sendgridFieldDefinitions,
        },
      })
    }
  })

  return {
    ...standardFields,
    custom_fields: customFieldsMappedToIds,
  }
}

type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T]
function typedObjectEntries<T extends object>(object: T): Entries<T>[] {
  return Object.entries(object) as Entries<T>[]
}
