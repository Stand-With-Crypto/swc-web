import * as Sentry from '@sentry/nextjs'

import { SendgridField } from '@/utils/server/sendgrid/marketing/constants'
import { SendgridContact } from '@/utils/server/sendgrid/marketing/contacts'

/**
 * Map Contact's custom_fields entries to their respective Sendgrid ID.
 * @param contact - The contact to format.
 * @param customFieldsMap - Object mapping Sendgrid field names to their respective Sendgrid ID.
 * @returns The formatted contact.
 */
export function formatContactCustomFields(
  contact: SendgridContact,
  customFieldsMap: Record<SendgridField, string | null>,
) {
  const { custom_fields, ...standardFields } = contact
  const customFieldsMappedToIds: Record<string, string | number> = {}

  typedObjectEntries(custom_fields).forEach(([fieldName, fieldValue]) => {
    const fieldId = customFieldsMap[fieldName]
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
          customFieldsMap,
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
