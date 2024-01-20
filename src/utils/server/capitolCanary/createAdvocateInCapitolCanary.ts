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
    campaigns: z.array(z.number()),
    email: z.string().email().trim().optional(),
    phone: z.string().trim().optional(),

    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),

    address1: z.string().trim().optional(),
    address2: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zip5: z.string().trim().optional(),
    country: z.string().trim().optional(),

    smsOptIn: z.boolean().optional(),
    smsOptInConfirmed: z.boolean().optional(),
    smsOptOut: z.boolean().optional(),

    emailOptIn: z.boolean().optional(),
    emailOptOut: z.boolean().optional(),

    p2aSource: z.string().trim().optional(),
    utm_source: z.string().trim().optional(),
    utm_medium: z.string().trim().optional(),
    utm_campaign: z.string().trim().optional(),
    utm_term: z.string().trim().optional(),
    utm_content: z.string().trim().optional(),

    tags: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include email or phone',
      })
    }
    if (data.zip5 && (data.zip5.length != 5 || !/^\d+$/.test(data.zip5))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid zip5 - must be 5-digit string',
      })
    }
    if (data.country && (data.country.length != 5 || !/^\d+$/.test(data.country))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid country - must be 5-digit string',
      })
    }
    if (data.phone && (!phoneRegex.test(data.phone) || data.phone.length != 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid phone number - must be 10-digit string',
      })
    }
    if (!data.phone && (data.smsOptIn || data.smsOptOut)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include phone if emailOptIn or smsOptOut is true',
      })
    }
    if (!data.smsOptIn && data.smsOptInConfirmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include smsOptIn if smsOptInConfirmed is true',
      })
    }
    if (!data.email && (data.emailOptIn || data.emailOptOut)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include email if emailOptIn or emailOptOut is true',
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
      firstname: request.firstName,
      lastname: request.lastName,
      smsOptin: request.smsOptIn ? 1 : 0,
      smsOptinConfirmed: request.smsOptInConfirmed ? 1 : 0,
      smsOptout: request.smsOptOut ? 1 : 0,
      emailOptin: request.emailOptIn ? 1 : 0,
      emailOptout: request.emailOptOut ? 1 : 0,

      firstName: undefined,
      lastName: undefined,
      smsOptIn: undefined,
      smsOptInConfirmed: undefined,
      smsOptOut: undefined,
      emailOptIn: undefined,
      emailOptOut: undefined,
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
  if (!httpResp) {
    throw new Error('no response from capitol canary')
  }
  return (await httpResp.json()) as createAdvocateInCapitolCanaryResponse
}
