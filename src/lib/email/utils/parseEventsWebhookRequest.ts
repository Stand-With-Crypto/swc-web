import { EmailEvent } from '@/lib/email/constants'

/**
 * @returns an object where the key is the message_id and the value is an array of events that message received
 */
export function parseEventsWebhookRequest(requestBody: EmailEvent[]) {
  return requestBody.reduce(
    (acc, eventEntry) => {
      if (!acc[eventEntry.sg_message_id]) {
        acc[eventEntry.sg_message_id] = []
      }

      acc[eventEntry.sg_message_id].push(eventEntry)

      return acc
    },
    {} as Record<string, EmailEvent[]>,
  )
}
