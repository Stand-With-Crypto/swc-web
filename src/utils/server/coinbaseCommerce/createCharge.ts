import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'

const COINBASE_COMMERCE_CREATE_CHARGE_URL = 'https://api.commerce.coinbase.com/charges'

const COINBASE_COMMERCE_API_KEY = requiredEnv(
  process.env.COINBASE_COMMERCE_API_KEY,
  'process.env.COINBASE_COMMERCE_API_KEY',
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

interface CreateChargeResponseWeb3Data {
  contract_addresses: Record<string, string>
  settlement_currency_addresses: Record<string, string>
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
  local_price?: {
    amount?: string
    currency?: string
  }
  metadata?: Record<string, string>
  pricing_type: 'fixed_price' | 'no_price'
  redirect_url?: string
}

export async function createCharge(sessionId: string) {
  const payload: CreateChargeRequest = {
    pricing_type: 'no_price',
    metadata: { sessionId },
    cancel_url: `https://www.standwithcrypto.org?sessionId=${sessionId}`,
  }

  try {
    const httpResp = await fetchReq(COINBASE_COMMERCE_CREATE_CHARGE_URL, {
      method: 'POST',
      mode: 'cors' as RequestMode,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_COMMERCE_API_KEY,
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
