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
  { cron: 'TZ=America/New_York 52 10 * * *' }, // Every day - 9AM EST
  async ({ step }) => {
    return await step.run('execute-script', async () => {
      return await sendEventNotifications()
    })
  },
)
