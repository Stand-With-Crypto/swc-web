import { groupBy } from 'lodash-es'
import { sendgridClient } from 'src/inngest/clients/sendgrid'
import { inngest } from 'src/inngest/inngest'

import { prismaClient } from '@/utils/server/prismaClient'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

/**
 * Synchronizes users from the database to SendGrid contacts, organized by country
 */
export const syncSendgridContacts = inngest.createFunction(
  { id: 'sync-sendgrid-contacts' },
  { cron: '0 0 * * *' }, // Daily at midnight
  async ({ step }) => {
    // 1. Fetch users from database
    const users = await step.run('fetch-users', async () => {
      // Use correct fields from schema
      return prismaClient.user.findMany({
        where: {
          countryCode: {
            in: ORDERED_SUPPORTED_COUNTRIES.map(country => country),
          },
          // primaryUserEmailAddressId: { not: null },
        },
        select: {
          id: true,
          primaryUserEmailAddress: {
            select: {
              emailAddress: true,
            },
          },
          userActions: {
            select: {
              actionType: true,
              campaignName: true,
            },
          },
          address: {
            select: {
              formattedDescription: true,
              locality: true,
              administrativeAreaLevel1: true,
              postalCode: true,
            },
          },
          phoneNumber: true,
          firstName: true,
          lastName: true,
          countryCode: true,
          datetimeCreated: true,
        },
      })
    })

    // 2. Group users by country
    const usersByCountry = await step.run('group-users-by-country', async () => {
      return groupBy(users, 'countryCode')
    })

    const results: Record<
      string,
      { success: boolean; count: number; error?: string; job_id?: string; method?: string }
    > = {}

    // 3. For each country, sync to the appropriate subuser or list
    for (const [country, countryUsers] of Object.entries(usersByCountry)) {
      // Skip if no users in this country
      if (countryUsers.length === 0) continue

      // Use camelCase for subuser name (sendgrid requirement)
      const subuser = `${country.toLowerCase()}Marketing`

      try {
        // TODO: Parallelize this step, remove await and use Promise.allSettled
        const result = await step.run(`sync-${country}-contacts`, async () => {
          try {
            // Create a list for this country if it doesn't exist
            // TODO: Make only one request for all lists (in a separate step)
            const listId = await sendgridClient.contacts.getOrCreateList(
              `${COUNTRY_CODE_TO_DISPLAY_NAME[country as SupportedCountryCodes]} Contacts`,
              {
                subuser,
              },
            )

            // Format users for SendGrid - map DB fields to SendGrid fields
            const contacts = countryUsers.map(user => {
              const email = user.primaryUserEmailAddress?.emailAddress || ''
              const userActions = user.userActions.map(
                action => `${action.actionType}-${action.campaignName}`,
              )

              return {
                external_id: user.id,
                email: `eduardopicolo87+${user.id}@gmail.com`,
                first_name: user.firstName || '',
                last_name: user.lastName || '',
                country: user.countryCode,
                address_line_1: user.address?.formattedDescription || '',
                city: user.address?.locality || '',
                state_province_region: user.address?.administrativeAreaLevel1 || '',
                postal_code: user.address?.postalCode || '',
                phone_number: user.phoneNumber || '',
                // Custom fields
                custom_fields: {
                  signup_date: user.datetimeCreated,
                  user_actions: userActions,
                  user_actions_number: userActions.length,
                },
              }
            })

            // Filter out any contacts without email addresses
            // const validContacts = contacts.filter(contact => !!contact.email)
            const validContacts = contacts

            // Skip if no valid contacts
            if (validContacts.length === 0) {
              return {
                success: true,
                count: 0,
                method: 'no-contacts',
              }
            }

            // Determine whether to use CSV upload or upsert based on contact count
            if (validContacts.length > 20000) {
              // For large batches, use the more efficient CSV upload
              const uploadResult = await sendgridClient.contacts.upload(validContacts, {
                subuser,
                listIds: [listId],
                listNames: [
                  `${COUNTRY_CODE_TO_DISPLAY_NAME[country as SupportedCountryCodes]} Contacts`,
                ],
              })
              return {
                success: true,
                count: validContacts.length,
                job_id: uploadResult.job_id,
                method: 'csv-upload',
              }
            } else {
              // For smaller batches, use the standard upsert method
              await sendgridClient.contacts.upsert(validContacts, {
                subuser,
                listIds: [listId],
                listNames: [
                  `${COUNTRY_CODE_TO_DISPLAY_NAME[country as SupportedCountryCodes]} Contacts`,
                ],
              })
              return {
                success: true,
                count: validContacts.length,
                method: 'upsert',
              }
            }
          } catch (error) {
            console.error(`Error syncing ${country} contacts:`, error)
            return {
              success: false,
              count: countryUsers.length,
              error: error instanceof Error ? error.message : String(error),
            }
          }
        })

        results[country] = result
      } catch (error) {
        results[country] = {
          success: false,
          count: countryUsers.length,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }

    return {
      totalUsers: users.length,
      countriesSynced: Object.keys(results).length,
      results,
    }
  },
)
