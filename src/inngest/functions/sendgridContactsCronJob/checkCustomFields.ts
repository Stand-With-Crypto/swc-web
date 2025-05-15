import { UserActionType } from '@prisma/client'

import {
  SENDGRID_CUSTOM_FIELDS,
  SendgridCustomField,
} from '@/utils/server/sendgrid/marketing/constants'
import {
  createSendgridCustomField,
  fetchSendgridCustomFields,
  FieldType,
  getSendgridUserActionCustomFieldName,
  mapSendgridFieldToFieldIds,
  SendgridUserActionCustomField,
} from '@/utils/server/sendgrid/marketing/customFields'
import { logger } from '@/utils/shared/logger'

export async function checkCustomFields() {
  const fieldDefinitions = await fetchSendgridCustomFields()
  const existingCustomFields = fieldDefinitions?.custom_fields?.map(field => field.name) || []

  logger.info(`Found ${existingCustomFields.length} existing custom fields`, {
    existingFields: existingCustomFields,
  })

  const fieldsToCreate = SENDGRID_CUSTOM_FIELDS.filter(
    fieldName => !existingCustomFields.includes(fieldName),
  )

  if (!fieldsToCreate.length) {
    logger.info('All required custom fields are set up')
    return {
      success: true,
      fieldIds: mapSendgridFieldToFieldIds(fieldDefinitions),
    }
  }

  logger.info(`Need to create ${fieldsToCreate.length} custom fields`, {
    fieldsToCreate,
  })

  const fieldTypes: Record<SendgridCustomField, FieldType> = {
    signup_date: 'Date',
    user_actions_count: 'Number',
    session_id: 'Text',
    ...(Object.fromEntries(
      Object.values(UserActionType).map(actionType => [
        getSendgridUserActionCustomFieldName(actionType),
        'Text',
      ]),
    ) as Record<SendgridUserActionCustomField, FieldType>),
  }

  const fieldPromises = fieldsToCreate.map(fieldName => {
    const fieldType = fieldTypes[fieldName]
    logger.info(`Creating custom field: ${fieldName} (${fieldType})`)
    return {
      fieldName,
      promise: createSendgridCustomField(fieldName, fieldType),
    }
  })
  const results = await Promise.allSettled(fieldPromises.map(({ promise }) => promise))

  const creationResults = results.map((result, index) => {
    const { fieldName } = fieldPromises[index]
    if (result.status === 'fulfilled') {
      return {
        fieldName,
        status: 'success',
        data: result.value,
      }
    } else {
      return {
        fieldName,
        status: 'error',
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      }
    }
  })
  const successCount = creationResults.filter(r => r.status === 'success').length
  const failureCount = creationResults.filter(r => r.status === 'error').length
  logger.info(`Created ${successCount} fields, ${failureCount} failed`, {
    results: creationResults,
  })
  if (failureCount > 0) {
    const errors = creationResults
      .filter(r => r.status === 'error')
      .map(r => `Field ${r.fieldName}: ${r.error || 'Unknown error'}`)
    logger.error(`Failed to create some custom fields: ${errors.join('; ')}`)
    throw new Error(`Failed to create custom fields: ${errors.join('; ')}`)
  }
  return {
    success: true,
    message: `Created ${successCount} fields, ${failureCount} failed`,
    results: creationResults,
  }
}
