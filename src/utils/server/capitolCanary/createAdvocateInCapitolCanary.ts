import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

const CAPITOL_CANARY_API_KEY = requiredEnv(
  process.env.CAPITOL_CANARY_API_KEY,
  'process.env.CAPITOL_CANARY_API_KEY',
)

const CAPITOL_CANARY_API_SECRET = requiredEnv(
  process.env.CAPITOL_CANARY_API_SECRET,
  'process.env.CAPITOL_CANARY_API_SECRET',
)

const CAPITOL_CANARY_CREATE_ADVOCATE_API_URL = 'https://api.phone2action.com/2.0/advocates'

// Schema based on: https://docs.phone2action.com/#:~:text=update%20Phone2Action%20advocates-,Create%20an%20advocate,-This%20endpoint%20will
export const createAdvocateSchema = z
  .object({
    // Capitol Canary campaigns to be joined.
    campaigns: z.array(z.number()),

    // Advocate information.
    email: z.string().email().optional(),
    phone: z
      .string()
      .length(10)
      .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/)
      .optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip5: z.string().length(5).regex(/^\d+$/).optional(),
    country: z.string().length(5).regex(/^\d+$/).optional(),

    // Opt-in/out.
    smsOptin: z.boolean().optional(),
    smsOptinConfirmed: z.boolean().optional(),
    smsOptout: z.boolean().optional(),
    emailOptin: z.boolean().optional(),
    emailOptout: z.boolean().optional(),

    // Metadata for Capitol Canary.
    p2aSource: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_term: z.string().optional(),
    utm_content: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include email or phone',
      })
    }
    if (!data.phone && (data.smsOptin || data.smsOptout)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include phone if emailOptin or smsOptout is true',
      })
    }
    if (!data.smsOptin && data.smsOptinConfirmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include smsOptin if smsOptinConfirmed is true',
      })
    }
    if (!data.email && (data.emailOptin || data.emailOptout)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include email if emailOptin or emailOptout is true',
      })
    }
  })

interface createAdvocateInCapitolCanaryResponse {
  success: number
  error: string
  type: string
  advocateid: string
}

export async function createAdvocateInCapitolCanary(request: z.infer<typeof createAdvocateSchema>) {
  const url = new URL(CAPITOL_CANARY_CREATE_ADVOCATE_API_URL)
  const httpResp = await fetchReq(url.href, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${CAPITOL_CANARY_API_KEY}:${CAPITOL_CANARY_API_SECRET}`)}`,
      'Content-Type': 'application/json',
    },
    // Changing the request body to match the Capitol Canary API.
    body: JSON.stringify({
      ...request,
      smsOptin: request.smsOptin ? 1 : 0,
      smsOptinConfirmed: request.smsOptinConfirmed ? 1 : 0,
      smsOptout: request.smsOptout ? 1 : 0,
      emailOptin: request.emailOptin ? 1 : 0,
      emailOptout: request.emailOptout ? 1 : 0,
    }),
  }).catch(error => {
    Sentry.captureException(error, {
      level: 'error',
      extra: {
        campaigns: request.campaigns,
        email: request.email,
        phone: request.phone,
      },
      tags: {
        domain: 'createAdvocateInCapitolCanary',
        campaigns: request.campaigns.join(','),
      },
    })
    throw error
  })
  return (await httpResp.json()) as createAdvocateInCapitolCanaryResponse
}
