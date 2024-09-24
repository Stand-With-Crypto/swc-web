import { EnqueueMessagePayload } from '@/inngest/functions/sms/enqueueMessages'
import { countSegments } from '@/utils/server/sms/utils'

export function countMessagesAndSegments(payload: EnqueueMessagePayload[]) {
  return payload.reduce(
    (acc, curr) => {
      let segmentsCount = 0

      curr.messages.forEach(message => {
        if (message.body) {
          segmentsCount += countSegments(message.body)
        }
        if (message.media) {
          // Each image count as one segment in the queue
          segmentsCount += message.media.length
        }
      })

      return {
        messages: acc.messages + curr.messages.filter(({ body }) => !!body).length,
        segments: acc.segments + segmentsCount,
      }
    },
    {
      segments: 0,
      messages: 0,
    },
  )
}
