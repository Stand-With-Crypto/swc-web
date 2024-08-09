import { sendEventNotifications } from '@/inngest/functions/eventNotification/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

interface ScriptPayload {
  limit: number
  persist: boolean
}

const SEND_EVENT_NOTIFICATION_INNGEST_EVENT_NAME = 'script/send-event-notification'
const SEND_EVENT_NOTIFICATION_INNGEST_FUNCTION_ID = 'script.send-event-notification'
export const sendEventNotificationWithInngest = inngest.createFunction(
  {
    id: SEND_EVENT_NOTIFICATION_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: SEND_EVENT_NOTIFICATION_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload
    return await step.run('execute-script', async () => {
      return await sendEventNotifications({
        limit: payload.limit,
        persist: payload.persist,
      })
    })
  },
)
