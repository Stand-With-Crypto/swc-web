import { sendEventNotifications } from '@/inngest/functions/eventNotification/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

const SEND_EVENT_NOTIFICATION_INNGEST_FUNCTION_ID = 'script.send-event-notification'

export const sendEventNotificationWithInngest = inngest.createFunction(
  {
    id: SEND_EVENT_NOTIFICATION_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { cron: 'TZ=America/New_York 0 12 * * *' }, // Every day - 12PM EST
  async ({ step, logger }) => {
    return await step.run('execute-script', async () => {
      return await sendEventNotifications(logger)
    })
  },
)
