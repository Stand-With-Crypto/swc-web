import { inngest } from '@/inngest/inngest'

const BACKFILL_MISSING_COMMUNICATIONS_INNGEST_FUNCTION_ID = 'script.backfill-missing-communications'
const BACKFILL_MISSING_COMMUNICATIONS_INNGEST_EVENT_NAME = 'script.backfill-missing-communications'

export interface BackfillMissingCommunicationsInngestEventSchema {
  name: typeof BACKFILL_MISSING_COMMUNICATIONS_INNGEST_EVENT_NAME
  data: {
    persist?: boolean
  }
}

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

export const backfillMissingCommunications = inngest.createFunction(
  {
    id: BACKFILL_MISSING_COMMUNICATIONS_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
  },
  {
    event: BACKFILL_MISSING_COMMUNICATIONS_INNGEST_EVENT_NAME,
  },
  async ({ step, event, logger }) => {
    const { persist } = event.data

    // 1. Identify userCommunicationJourneys missing a userCommunication

    // 2. Find a matching userCommunication reference
    //   Search for another userCommunicationJourney with the same campaign name (bulk-welcome)
    //   If no direct match is found, locate the first BULK_SMS sent before and after the userCommunicationJourney creation date

    // 3. Reference the useCommunication with the matching userCommunicationJourney
  },
)
