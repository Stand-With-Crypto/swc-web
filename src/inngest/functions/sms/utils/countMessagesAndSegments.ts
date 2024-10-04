import { update } from 'lodash-es'

import type { EnqueueMessagePayload } from '@/inngest/functions/sms/enqueueMessages'
import { countSegments } from '@/utils/server/sms/utils'

export function countMessagesAndSegments(payload: EnqueueMessagePayload[]): {
  segments: number
  messages: number
} {
  let segmentsCount = 0
  let messagesCount = 0

  const userCountByMessageBody: Record<string, number> = {}

  payload.forEach(({ messages }) => {
    messages.forEach(msg => {
      if (msg.media) {
        // Each image count as one segment in the queue
        segmentsCount += msg.media.length
      }

      if (msg.body) {
        messagesCount += 1

        update(userCountByMessageBody, [msg.body], (current = 0) => current + 1)
      }
    })
  })

  Object.keys(userCountByMessageBody).forEach(message => {
    const messageSegments = countSegments(message)

    segmentsCount += messageSegments * userCountByMessageBody[message]
  })

  return {
    segments: segmentsCount,
    messages: messagesCount,
  }
}
