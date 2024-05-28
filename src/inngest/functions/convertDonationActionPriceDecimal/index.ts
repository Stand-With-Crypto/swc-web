import { convertDonationActionPriceDecimal } from '@/inngest/functions/convertDonationActionPriceDecimal/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

interface ScriptPayload {
  limit: number
  persist: boolean
}

const CONVERT_DONATION_ACTION_PRICE_DECIMAL_EVENT_NAME =
  'script/convert-donation-action-price-decimal'
const CONVERT_DONATION_ACTION_PRICE_DECIMAL_FUNCTION_ID =
  'script.convert-donation-action-price-decimal'
export const backfillDonationActionWithInngest = inngest.createFunction(
  {
    id: CONVERT_DONATION_ACTION_PRICE_DECIMAL_EVENT_NAME,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: CONVERT_DONATION_ACTION_PRICE_DECIMAL_FUNCTION_ID },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload
    return await step.run('execute-script', async () => {
      return await convertDonationActionPriceDecimal({
        limit: payload.limit,
        persist: payload.persist,
      })
    })
  },
)
