import * as fs from 'fs'
import { uniq } from 'lodash-es'
import path from 'path'
import * as XLSX from 'xlsx'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  SendgridContact,
  upsertSendgridContactsArray,
} from '@/utils/server/sendgrid/marketing/contacts'
import {
  createSendgridCustomField,
  FieldType,
  mapSendgridFieldToFieldIds,
  fetchSendgridCustomFields,
  SendgridCustomField,
  SENDGRID_CUSTOM_FIELDS,
} from '@/utils/server/sendgrid/marketing/customFields'
import {
  fetchSendgridContactList,
  getSendgridContactListName,
} from '@/utils/server/sendgrid/marketing/lists'
import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

type UserForSendgrid = {
  id: string
  primaryUserEmailAddress?: {
    emailAddress: string
  } | null
  userActions: {
    actionType: string
    campaignName: string
  }[]
  address?: {
    formattedDescription: string | null
    locality: string | null
    administrativeAreaLevel1: string | null
    postalCode: string | null
  } | null
  phoneNumber: string | null
  firstName: string | null
  lastName: string | null
  countryCode: string
  datetimeCreated: Date | string
  // userSessions: {
  //   id: string
  // }[]
}

/**
 * Format users to SendGrid contact format for CSV export
 * Following SendGrid CSV formatting guidelines:
 * https://www.twilio.com/docs/sendgrid/ui/managing-contacts/formatting-a-csv
 */
function formatUsersToSendgridContacts(users: UserForSendgrid[]) {
  return users.map(user => {
    const email = user.primaryUserEmailAddress?.emailAddress || ''
    const completedUserActions = uniq(user.userActions.map(action => action.actionType)).join(';')

    // Clean address data to avoid CSV parsing issues
    const addressLine1 = user.address?.formattedDescription || ''
    // Replace commas with spaces to avoid CSV parsing issues
    const cleanAddressLine1 = addressLine1.replace(/,/g, ' ')

    // Format date according to SendGrid requirements (MM/DD/YYYY)
    let formattedDate = ''
    if (user.datetimeCreated) {
      const date =
        user.datetimeCreated instanceof Date ? user.datetimeCreated : new Date(user.datetimeCreated)

      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear()
      formattedDate = `${month}/${day}/${year}`
    }

    // Ensure field names in CSV match exactly what SendGrid expects
    return {
      // Put email as first column (identifier) as per SendGrid requirements
      // email: `samira.ucb+${user.id}@gmail.com`, // Use test email for development
      email,
      external_id: user.id, // Don't append @gmail.com in CSV version
      first_name: user.firstName || '',
      last_name: user.lastName || '',
      // Ensure country is in uppercase for consistency
      country: user.countryCode.toUpperCase(),
      address_line_1: cleanAddressLine1,
      address_line_2: '', // Include this field to match API format
      city: user.address?.locality || '',
      state_province_region: user.address?.administrativeAreaLevel1 || '',
      postal_code: user.address?.postalCode || '',
      phone_number: user.phoneNumber || '',
      // Custom fields - properly formatted for SendGrid
      signup_date: formattedDate,
      completed_user_actions: completedUserActions,
      user_actions_count: user.userActions.length.toString(),
      // session_id: user.userSessions?.[0]?.id || '',
    }
  })
}

/**
 * Create and write CSV file with proper quoting to avoid parsing issues
 */
function writeContactsToCSV(contacts: any[], fieldMappings: string[], outputPath: string) {
  // Create CSV header
  const header = fieldMappings.join(',')

  // Create CSV rows with proper quoting
  const rows = contacts.map(contact => {
    return fieldMappings
      .map(field => {
        const value = contact[field] || ''
        // Quote all fields to ensure proper CSV format, especially for fields with commas
        return `"${String(value).replace(/"/g, '""')}"`
      })
      .join(',')
  })

  // Combine header and rows
  const csvContent = [header, ...rows].join('\n')

  // Write to file
  fs.writeFileSync(outputPath, csvContent, 'utf8')

  return csvContent
}

/**
 * Ensure that all required custom fields exist in SendGrid
 */
async function ensureCustomFieldsExist() {
  console.log('Verifying SendGrid custom fields...')

  // Field type mapping for required fields
  const fieldTypes: Record<string, FieldType> = {
    signup_date: 'Date',
    completed_user_actions: 'Text',
    user_actions_count: 'Number',
    // session_id: 'Text',
  }

  // Get existing fields
  const fieldDefinitions = await fetchSendgridCustomFields()
  const existingCustomFields = fieldDefinitions?.custom_fields?.map(field => field.name) || []

  console.log(`Found ${existingCustomFields.length} existing custom fields in SendGrid`)

  // Check which fields need to be created
  const fieldsToCreate = SENDGRID_CUSTOM_FIELDS.filter(
    fieldName => !existingCustomFields.includes(fieldName),
  )

  if (fieldsToCreate.length === 0) {
    console.log('✅ All required custom fields already exist in SendGrid')
    return {
      success: true,
      fieldIds: mapSendgridFieldToFieldIds(fieldDefinitions),
    }
  }

  console.log(
    `Creating ${fieldsToCreate.length} missing custom fields: ${fieldsToCreate.join(', ')}`,
  )

  // Create promises for each field creation
  const fieldPromises = fieldsToCreate.map(fieldName => {
    const fieldType = fieldTypes[fieldName]
    console.log(`Creating custom field: ${fieldName} (${fieldType})`)
    return {
      fieldName,
      promise: createSendgridCustomField(fieldName, fieldType),
    }
  })

  // Execute all promises in parallel
  const results = await Promise.allSettled(fieldPromises.map(({ promise }) => promise))

  // Match results with field names
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

  // Count successes and failures
  const successCount = creationResults.filter(r => r.status === 'success').length
  const failureCount = creationResults.filter(r => r.status === 'error').length

  if (failureCount > 0) {
    const errors = creationResults
      .filter(r => r.status === 'error')
      .map(r => `Field ${r.fieldName}: ${r.error || 'Unknown error'}`)

    console.error(`Failed to create some custom fields: ${errors.join('; ')}`)
    console.log(
      '⚠️ Some custom fields could not be created. The CSV generation will continue, but you may need to manually create these fields before uploading.',
    )
  } else {
    console.log(`✅ Successfully created ${successCount} custom fields in SendGrid`)
  }
}

/**
 * Ensure that contact lists exist for each country
 */
async function ensureContactListsExist(countries: SupportedCountryCodes[]) {
  console.log('Verifying SendGrid contact lists...')

  const results = []

  for (const countryCode of countries) {
    try {
      const listName = getSendgridContactListName(countryCode)
      console.log(`Checking if contact list exists for ${countryCode}: "${listName}"`)

      const list = (await fetchSendgridContactList(listName)) as {
        id: string
        contact_count: number
      }
      // Log without template literals to avoid type issues
      console.log(
        '✅ Contact list for',
        countryCode,
        'exists:',
        list.id,
        '(' + list.contact_count + ' contacts)',
      )

      results.push({
        countryCode,
        status: 'success' as const,
        id: list.id,
        name: listName,
        contactCount: list.contact_count,
      })
    } catch (error) {
      console.error(`Error verifying contact list for ${countryCode}:`, error)
      results.push({
        countryCode,
        status: 'error' as const,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const failureCount = results.filter(r => r.status === 'error').length

  if (failureCount > 0) {
    console.log(
      `⚠️ Failed to verify ${failureCount} contact lists. You may need to manually create these lists before uploading.`,
    )
  } else {
    console.log(`✅ All ${successCount} country contact lists exist in SendGrid`)
  }

  return results
}

/**
 * Generate CSV files for SendGrid contacts, one file per country
 */
async function generateSendgridContactsCsv() {
  // Filter out US from supported countries
  const countries = ORDERED_SUPPORTED_COUNTRIES.filter(
    countryCode => countryCode !== SupportedCountryCodes.US,
  )
  console.log(`Will process contacts for ${countries.length} countries: ${countries.join(', ')}`)

  // First, ensure all required custom fields exist
  await ensureCustomFieldsExist()

  // Then, ensure all required contact lists exist
  const contactLists = await ensureContactListsExist(countries)
  const contactListsByCountry = contactLists.reduce(
    (acc, list) => {
      if (list.status === 'success') {
        acc[list.countryCode] = list.id
      }
      return acc
    },
    {} as Record<SupportedCountryCodes, string>,
  )
  console.log('Contact lists:', contactLists)

  // Get SendGrid field definitions and IDs
  const fieldDefinitions = await fetchSendgridCustomFields()
  const fieldIds = mapSendgridFieldToFieldIds(fieldDefinitions)

  // Log field IDs for debugging
  console.log('\nSendGrid Field IDs:')
  Object.entries(fieldIds).forEach(([fieldName, fieldId]) => {
    console.log(`${fieldName}: ${fieldId || 'Not found'}`)
  })

  // Field mappings for CSV columns - use only the fields we have data for
  const fieldMappings = [
    'email',
    'external_id',
    'first_name',
    'last_name',
    'country',
    'address_line_1',
    'address_line_2',
    'city',
    'state_province_region',
    'postal_code',
    'phone_number',
    'signup_date',
    'completed_user_actions',
    'user_actions_count',
    // 'session_id',
  ]

  // Make sure the output directory exists
  const outputDir = path.resolve('./src/bin/localCache/sendgrid-contacts')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Process each country
  let totalContacts = 0
  const totalUpsertedContacts = 0
  const totalUpsertErrors = 0

  for (const countryCode of countries) {
    console.log(`\nProcessing country: ${countryCode}`)

    // Fetch users for this country
    console.log(`Fetching users for country ${countryCode}...`)
    const users = await prismaClient.user.findMany({
      where: {
        countryCode: {
          in: [countryCode],
        },
        // primaryUserEmailAddressId: { not: null },
      },
      include: {
        primaryUserEmailAddress: true,
        userActions: true,
        // userSessions: true,
        address: true,
      },
    })

    if (users.length === 0) {
      console.log(`No users found for country ${countryCode}, skipping.`)
      continue
    }

    console.log(`Found ${users.length} users for country ${countryCode}`)

    // 1. Format users to SendGrid contacts (flat structure for CSV export)
    console.log(`Formatting ${users.length} users as SendGrid contacts...`)
    const contacts = formatUsersToSendgridContacts(users)

    // Filter out contacts without email addresses
    // const validContacts = contacts.filter(contact => !!contact.email)
    const validContacts = contacts

    if (validContacts.length === 0) {
      console.log(
        `No valid contacts found for country ${countryCode} (no email addresses), skipping.`,
      )
      continue
    }

    // 2. Generate CSV files
    console.log(`Creating CSV file for ${validContacts.length} contacts...`)

    // Create output filenames
    const csvFilename = `sendgrid-contacts-${countryCode}.csv`
    const csvFilenameWithIds = `sendgrid-contacts-${countryCode}-with-ids.csv`
    const csvPath = path.join(outputDir, csvFilename)
    const csvPathWithIds = path.join(outputDir, csvFilenameWithIds)

    // Add debug information
    console.log('\nCSV Debug Information:')
    console.log('Header row:', fieldMappings.join(','))
    if (validContacts.length > 0) {
      const firstContact = validContacts[0]
      console.log(
        'First row data:',
        fieldMappings.map(field => firstContact[field as keyof typeof firstContact]).join(','),
      )
    }

    // Show header comparisons
    console.log('\nHeader comparison:')
    console.log('Standard CSV header:', fieldMappings.join(','))
    console.log(
      'Field ID CSV header:',
      fieldMappings
        .map(field => (fieldIds as Record<string, string | null>)[field] || field)
        .join(','),
    )

    // Still create Excel file for reference
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(validContacts, {
      header: fieldMappings,
    })
    XLSX.utils.book_append_sheet(workbook, worksheet, `${countryCode} Contacts`)
    XLSX.writeFile(workbook, csvPath)

    // // Create properly escaped CSV with quotation marks around fields
    // console.log('\nGenerating standard CSV with field names as headers...')
    // const csvContent = writeContactsToCSV(validContacts, fieldMappings, csvPath)

    // // Create second CSV with field IDs as headers for SendGrid
    // console.log('Generating CSV with field IDs as headers...')
    // const csvContentWithIds = writeSendGridFormatCSV(
    //   validContacts,
    //   fieldMappings,
    //   csvPathWithIds,
    //   true,
    //   fieldIds as Record<string, string | null>,
    // )

    console.log(
      `\n✅ Generated CSV files for ${countryCode} with ${validContacts.length} contacts:`,
    )
    console.log(`   Standard CSV: ${csvPath}`)
    console.log(`   CSV with field IDs: ${csvPathWithIds}`)

    // 3. Upsert contacts via API if we have the list ID
    // if (contactListsByCountry[countryCode]) {
    //   console.log(`\nUpserting contacts to SendGrid for ${countryCode}...`)

    //   // Format users for API upsert (with nested custom_fields)
    //   const apiContacts = formatUsersToSendgridApiContacts(users)
    //   // const validApiContacts = apiContacts.filter(contact => !!contact.email)
    //   const validApiContacts = apiContacts

    //   const upsertResult = await upsertContactsToSendgrid(
    //     validApiContacts.slice(0, 2),
    //     contactListsByCountry[countryCode],
    //     countryCode,
    //   )

    //   if (upsertResult.success) {
    //     console.log(
    //       `✅ Successfully upserted ${upsertResult.successCount || 0} contacts to SendGrid for ${countryCode}`,
    //     )
    //   } else {
    //     console.log(
    //       `⚠️ Partially upserted contacts to SendGrid for ${countryCode}: ${upsertResult.successCount || 0} succeeded, ${upsertResult.errorCount || 0} failed`,
    //     )
    //   }

    //   totalUpsertedContacts += upsertResult.successCount || 0
    //   totalUpsertErrors += upsertResult.errorCount || 0
    // } else {
    //   console.log(`⚠️ Skipping API upsert for ${countryCode} - no valid list ID found`)
    // }

    totalContacts += validContacts.length
  }

  console.log(`\n📊 Summary:`)
  console.log(
    `🗄️ Generated CSV files for ${totalContacts} contacts across ${countries.length} countries`,
  )
  console.log(`📁 All CSV files saved in: ${outputDir}`)

  if (totalUpsertedContacts > 0 || totalUpsertErrors > 0) {
    console.log(
      `🔄 API Upsert: ${totalUpsertedContacts} contacts successfully upserted, ${totalUpsertErrors} failed`,
    )
  }

  console.log(`\n🔍 Next steps:`)
  if (totalUpsertErrors > 0) {
    console.log(`1. Review any API upsert errors`)
    console.log(`2. For failed contacts, upload the corresponding CSV files manually`)
  } else if (totalUpsertedContacts === 0) {
    console.log(`1. Go to SendGrid dashboard > Marketing > Contacts > Add Contacts > Upload CSV`)
    console.log(`2. Upload each country's CSV file to its corresponding contact list`)
    console.log(`3. Map the CSV columns to their corresponding fields in SendGrid`)
  } else {
    console.log(`1. Verify that contacts were successfully upserted in the SendGrid dashboard`)
    console.log(`2. Manual CSV files are also available if needed for future uploads`)
  }
}

/**
 * Format users to SendGrid API contact format (with nested custom_fields)
 */
function formatUsersToSendgridApiContacts(users: UserForSendgrid[]): SendgridContact[] {
  return users.map(user => {
    const email = user.primaryUserEmailAddress?.emailAddress || ''
    const completedUserActions = uniq(user.userActions.map(action => action.actionType)).join(';')

    // Format date according to SendGrid requirements
    const formattedDate =
      user.datetimeCreated instanceof Date
        ? user.datetimeCreated.toISOString()
        : user.datetimeCreated

    return {
      external_id: user.id + '@gmail.com',
      email: `eduardonpicolo+${user.id}@gmail.com`,
      first_name: user.firstName || '',
      last_name: user.lastName || '',
      country: user.countryCode.toUpperCase(),
      address_line_1: user.address?.formattedDescription?.replace(/,/g, ' ') || '',
      address_line_2: '',
      city: user.address?.locality || '',
      state_province_region: user.address?.administrativeAreaLevel1 || '',
      postal_code: user.address?.postalCode || '',
      phone_number: user.phoneNumber || '',
      custom_fields: {
        signup_date: formattedDate,
        completed_user_actions: completedUserActions,
        user_actions_count: user.userActions.length.toString(),
        // session_id: user.userSessions?.[0]?.id || '',
      },
    }
  })
}

/**
 * Interface for SendGrid contact import responses
 */
interface SendgridContactsUpsertResponse {
  job_id: string
}

/**
 * Interface for SendGrid job status responses
 */
interface SendgridJobStatusResponse {
  id: string
  status: 'pending' | 'completed' | 'errored' | 'failed'
  job_type: 'upsert' | 'delete'
  results?: {
    requestedCount?: number
    createdCount?: number
    updatedCount?: number
    deletedCount?: number
    erroredCount?: number
    errorsUrl?: string
    startedAt?: string
    finishedAt?: string
  }
}

async function upsertContactsToSendgrid(
  contacts: SendgridContact[],
  listId: string,
  countryCode: string,
) {
  if (contacts.length === 0) {
    console.log(`No contacts to upsert for ${countryCode}`)
    return { success: true, count: 0, successCount: 0, errorCount: 0 }
  }

  console.log(`Upserting ${contacts.length} contacts for ${countryCode}...`)

  try {
    const response = (await upsertSendgridContactsArray(contacts, {
      listIds: [listId],
    })) as SendgridContactsUpsertResponse
    console.log(
      `✅ Successfully initiated upsert for ${contacts.length} contacts to SendGrid, job ID: ${response.job_id}`,
    )

    // Start polling for job status
    const finalStatus = await checkSendgridContactsImportStatus(response.job_id, true)

    if (finalStatus.status === 'completed') {
      console.log(`✅ Upsert job completed successfully!`)
      return {
        success: true,
        jobId: response.job_id,
        totalContacts: contacts.length,
        successCount:
          (finalStatus.results?.createdCount || 0) + (finalStatus.results?.updatedCount || 0),
        errorCount: finalStatus.results?.erroredCount || 0,
      }
    } else {
      console.error(`❌ Upsert job finished with status: ${finalStatus.status}`)
      return {
        success: false,
        jobId: response.job_id,
        totalContacts: contacts.length,
        successCount:
          (finalStatus.results?.createdCount || 0) + (finalStatus.results?.updatedCount || 0),
        errorCount: finalStatus.results?.erroredCount || 0,
      }
    }
  } catch (error) {
    console.error(`❌ Error upserting contacts to SendGrid:`, error)

    return {
      success: false,
      totalContacts: contacts.length,
      successCount: 0,
      errorCount: contacts.length,
    }
  }
}

/**
 * Check the status of a SendGrid contact import job
 * @param jobId The job ID returned from a contact import operation
 * @param pollUntilComplete If true, keep polling until job is no longer pending
 * @param maxAttempts Maximum number of polling attempts
 * @param pollInterval Interval between polling attempts in ms
 * @returns The status and results of the import job
 */
async function checkSendgridContactsImportStatus(
  jobId: string,
  pollUntilComplete: boolean = false,
  maxAttempts: number = 30,
  pollInterval: number = 2000,
): Promise<SendgridJobStatusResponse> {
  console.log(`Checking import status for job ID: ${jobId}`)

  try {
    const [response, body] = await SendgridClient.request({
      url: `/v3/marketing/contacts/imports/${jobId}`,
      method: 'GET',
    })

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const jobStatus = body as SendgridJobStatusResponse

      console.log(`Import job status: ${jobStatus.status}`)

      if (jobStatus.results) {
        console.log(`Results:`)
        console.log(`- Requested: ${jobStatus.results.requestedCount || 0}`)
        console.log(`- Created: ${jobStatus.results.createdCount || 0}`)
        console.log(`- Updated: ${jobStatus.results.updatedCount || 0}`)
        console.log(`- Errored: ${jobStatus.results.erroredCount || 0}`)

        if (jobStatus.results.errorsUrl) {
          console.log(`Error details available at: ${jobStatus.results.errorsUrl}`)
        }
      }

      // If not polling or job is already complete, return results immediately
      if (!pollUntilComplete || jobStatus.status !== 'pending') {
        return jobStatus
      }

      // Poll until job is complete or max attempts reached
      let currentAttempt = 1
      let currentStatus = jobStatus

      while (currentStatus.status === 'pending' && currentAttempt < maxAttempts) {
        console.log(
          `Job still pending. Polling again in ${pollInterval / 1000}s (attempt ${currentAttempt}/${maxAttempts})...`,
        )

        // Wait for the polling interval
        await new Promise(resolve => setTimeout(resolve, pollInterval))

        // Check status again
        const [newResponse, newBody] = await SendgridClient.request({
          url: `/v3/marketing/contacts/imports/${jobId}`,
          method: 'GET',
        })

        if (newResponse.statusCode >= 200 && newResponse.statusCode < 300) {
          currentStatus = newBody as SendgridJobStatusResponse
          console.log(`Updated job status: ${currentStatus.status}`)

          if (currentStatus.status !== 'pending') {
            console.log(`Job is no longer pending. Final status: ${currentStatus.status}`)

            if (currentStatus.results) {
              console.log(`Final results:`)
              console.log(`- Requested: ${currentStatus.results.requestedCount || 0}`)
              console.log(`- Created: ${currentStatus.results.createdCount || 0}`)
              console.log(`- Updated: ${currentStatus.results.updatedCount || 0}`)
              console.log(`- Errored: ${currentStatus.results.erroredCount || 0}`)
              console.log(`- Errors URL: ${currentStatus.results.errorsUrl || ''}`)

              if (currentStatus.results.errorsUrl) {
                console.log(`Error details available at: ${currentStatus.results.errorsUrl}`)
              }
            }

            return currentStatus
          }
        } else {
          console.error(`Error checking job status: ${newResponse.statusCode}`, newBody)
          throw new Error(`Failed to check job status: ${newResponse.statusCode}`)
        }

        currentAttempt++
      }

      if (currentStatus.status === 'pending') {
        console.warn(`Maximum polling attempts (${maxAttempts}) reached. Job is still pending.`)
      }

      return currentStatus
    } else {
      console.error(`Error checking import status: ${response.statusCode}`, body)
      throw new Error(`Failed to check import status: ${response.statusCode}`)
    }
  } catch (error) {
    console.error(`Failed to check import status:`, error)
    throw error
  }
}

/**
 * Creates and writes a CSV file for SendGrid with options to use field IDs in headers
 */
function writeSendGridFormatCSV(
  contacts: any[],
  fieldMappings: string[],
  outputPath: string,
  useFieldIds: boolean = false,
  fieldIds: Record<string, string | null> = {},
) {
  // For the header row, we can either use the field names or their IDs
  const headerRow = fieldMappings
    .map(field => {
      if (useFieldIds && fieldIds[field]) {
        return fieldIds[field] // Use the field ID if available
      }
      return field // Otherwise use the field name
    })
    .join(',')

  // Create CSV rows with proper quoting
  const rows = contacts.map(contact => {
    return fieldMappings
      .map(field => {
        const value = contact[field] || ''
        // Quote all fields to ensure proper CSV format, especially for fields with commas
        return `"${String(value).replace(/"/g, '""')}"`
      })
      .join(',')
  })

  // Combine header and rows
  const csvContent = [headerRow, ...rows].join('\n')

  // Write to file
  fs.writeFileSync(outputPath, csvContent, 'utf8')

  return csvContent
}

void runBin(generateSendgridContactsCsv)
