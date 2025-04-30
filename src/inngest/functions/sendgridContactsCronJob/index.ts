import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

import { syncCountryContacts } from './logic'

export const SYNC_SENDGRID_CONTACTS_INNGEST_EVENT_NAME = 'cron/sync-sendgrid-contacts'
export const SYNC_SENDGRID_CONTACTS_FUNCTION_ID = 'cron.sync-sendgrid-contacts'

export type SyncSendgridContactsCronJobSchema = {
  name: typeof SYNC_SENDGRID_CONTACTS_INNGEST_EVENT_NAME
  data?: Record<string, never>
}

export const syncSendgridContacts = inngest.createFunction(
  { id: SYNC_SENDGRID_CONTACTS_FUNCTION_ID, onFailure: onScriptFailure },
  { event: SYNC_SENDGRID_CONTACTS_INNGEST_EVENT_NAME },
  async ({ step }) => {
    const resultsPromises = []
    // Skip US for now
    for (const countryCode of ORDERED_SUPPORTED_COUNTRIES.filter(
      countryCode => countryCode !== SupportedCountryCodes.US,
    )) {
      resultsPromises.push(
        step.invoke(`sync-${countryCode}-contacts`, {
          function: syncCountryContacts,
          data: {
            countryCode,
          },
        }),
      )
    }

    const results = await Promise.allSettled(resultsPromises)

    return results
  },
)
