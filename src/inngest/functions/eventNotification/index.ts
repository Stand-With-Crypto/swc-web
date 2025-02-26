import { sendEventNotifications } from '@/inngest/functions/eventNotification/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

const SEND_EVENT_NOTIFICATION_INNGEST_FUNCTION_ID = 'script.send-event-notification'

const countryCodeToTimezoneMap: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.US]: 'America/New_York',
  // TODO: uncomment this line when we add support for UK
  // [SupportedCountryCodes.UK]: 'Europe/London',
}

export const globalSendEventNotifications = ORDERED_SUPPORTED_COUNTRIES.map(countryCode => {
  return inngest.createFunction(
    {
      id: `${SEND_EVENT_NOTIFICATION_INNGEST_FUNCTION_ID}-${countryCode}`,
      retries: 0,
      onFailure: onScriptFailure,
    },
    { cron: `TZ=${countryCodeToTimezoneMap[countryCode]} 0 12 * * *` }, // Every day - 12PM EST
    async ({ step, logger }) => {
      return await step.run('execute-script', async () => {
        return await sendEventNotifications(countryCode, logger)
      })
    },
  )
})
