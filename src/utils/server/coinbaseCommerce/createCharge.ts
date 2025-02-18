import * as Sentry from '@sentry/nextjs'

import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const COINBASE_COMMERCE_CREATE_CHARGE_URL = 'https://api.commerce.coinbase.com/charges'

const COINBASE_COMMERCE_API_KEY = requiredOutsideLocalEnv(
  process.env.COINBASE_COMMERCE_API_KEY,
  'process.env.COINBASE_COMMERCE_API_KEY',
  'COINBASE COMMERCE API KEY to integrate with Coinbase Commerce API',
)

interface CreateChargeResponsePricing {
  local: {
    amount: string
    currency: string
  }
  settlement: {
    amount: string
    currency: string
  }
}

interface CreateChargeResponseRedirects {
  cancel_url: string
  success_url: string
  will_redirect_after_success: boolean
}

interface CreateChargeResponseTimeline {
  status: string
  time: string
}

interface CreateChargeResponseTransferIntent {
  call_data: CreateChargeResponseTransferIntentCallData
  metadata: Record<string, string>
}

interface CreateChargeResponseTransferIntentCallData {
  deadline: string
  fee_amount: string
  id: string
  operator: string
  prefix: string
  recipient: string
  recipent_amount: string
  recipient_currency: string
  refund_destination: string
  signature: string
}

interface CreateChargeResponseWeb3Data {
  contract_addresses: Record<string, string>
  settlement_currency_addresses: Record<string, string>
  subsidized_payments_chain_to_tokens: Record<string, string>
  failure_events: Record<string, string>[]
  success_events: Record<string, string>[]
  transfer_intent?: CreateChargeResponseTransferIntent
}

interface CreateChargeResponseData {
  addresses?: Record<string, string> // From Commerce V1 API.
  charge_kind: string
  collected_email: boolean
  cancel_url?: string // From Commerce V1 API.
  created_at: string
  exchange_rates: Record<string, string> // From Commerce V1 API.
  expires_at: string
  hosted_url: string // This is the URL to use.
  id: string
  local_exchange_rates: Record<string, string> // From Commerce V1 API.
  metadata: Record<string, string>
  organization_name: string
  payments: any[]
  pricing: CreateChargeResponsePricing
  pricing_type: string
  redirects: CreateChargeResponseRedirects
  support_email: string
  timeline: CreateChargeResponseTimeline[]
  web3_data: CreateChargeResponseWeb3Data
  web3_retail_payments_enabled: boolean
}

interface CreateChargeResponse {
  data: CreateChargeResponseData
}

interface CreateChargeRequest {
  buyer_locale?: string
  cancel_url?: string
  checkout_id?: string
  description?: string
  local_price?: {
    amount?: string
    currency?: string
  }
  metadata?: Record<string, string | boolean> // Pass session ID, email, and other fields through here.
  name?: string
  pricing_type: 'fixed_price' | 'no_price'
  redirect_url?: string
}

export async function createCharge({ sessionId, userId }: { sessionId: string; userId: string }) {
  const payload: CreateChargeRequest = {
    cancel_url: `https://www.standwithcrypto.org?sessionId=${sessionId}`,
    metadata: { sessionId, userId },
    pricing_type: 'no_price',
  }

  try {
    const httpResp = await fetchReq(COINBASE_COMMERCE_CREATE_CHARGE_URL, {
      method: 'POST',
      mode: 'cors' as RequestMode,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CC-Api-Key': String(COINBASE_COMMERCE_API_KEY),
      },
      body: JSON.stringify(payload),
    })
    return (await httpResp.json()) as CreateChargeResponse
  } catch (error) {
    Sentry.captureException(error, {
      level: 'error',
      extra: { sessionId },
    })
    throw error
  }
}
