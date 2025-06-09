import { groupBy } from 'lodash-es'

import { EmailEvent, MarketingEmailEvent } from '@/utils/server/email/constants'

/**
 * @returns an object where the key is the message_id and the value is an array of events that message received
 */
export function parseEventsWebhookRequest(requestBody: EmailEvent[]) {
  const transactionalEvents = requestBody.filter(
    event => !isMarketingEmailEvent(event) && Boolean(event.sg_message_id),
  )
  return groupBy(transactionalEvents, 'sg_message_id')
}

function isMarketingEmailEvent(event: EmailEvent): event is MarketingEmailEvent {
  return (
    ('singlesend_id' in event && 'singlesend_name' in event) ||
    ('mc_stats' in event && 'mc_pod_id' in event)
  )
}
