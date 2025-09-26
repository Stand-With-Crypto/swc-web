import * as Sentry from '@sentry/nextjs'
import path from 'node:path'

import {
  BUILDER_IO_BILL_PREFIX,
  BUILDER_IO_BILL_PUBLISHED_STATE,
  QUORUM_API_BILL_ENDPOINT,
  QUORUM_API_BILL_SUMMARY_ENDPOINT,
  QUORUM_API_BILLS_PER_PAGE,
} from '@/inngest/functions/stateLevelBillsCronJob/utils/config'
import {
  BUILDER_IO_WRITE_API_ENDPOINT,
  QUORUM_API_AUTH_QUERY_PARAMS,
  QUORUM_API_ENDPOINT,
  QUORUM_API_FILTER_QUERY_PARAMS,
} from '@/inngest/functions/stateLevelBillsCronJob/utils/constants'
import { resolveFields } from '@/inngest/functions/stateLevelBillsCronJob/utils/resolveFields'
import {
  CreateBillEntryPayload,
  QuorumBillApiObject,
  QuorumBillApiResponse,
  QuorumBillSummaryApiObject,
  QuorumBillSummaryApiResponse,
  UpdateBillEntryPayload,
} from '@/inngest/functions/stateLevelBillsCronJob/utils/types'
import { getAllBillsWithOffset } from '@/utils/server/builder/models/data/bills'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCBillFromBuilderIO } from '@/utils/shared/zod/getSWCBills'

export const BUILDER_IO_PRIVATE_KEY = requiredOutsideLocalEnv(
  process.env.BUILDER_IO_PRIVATE_KEY,
  'BUILDER_IO_PRIVATE_KEY',
  'State-level bills CRON Job',
)!

export interface PaginationParams {
  limit: number
  offset: number
}

export async function fetchQuorumBills(paginationParams: PaginationParams) {
  const searchParams = Object.entries({
    limit: String(paginationParams.limit),
    offset: String(paginationParams.offset),

    ...QUORUM_API_FILTER_QUERY_PARAMS,
    ...QUORUM_API_AUTH_QUERY_PARAMS,
  })
    .filter(([_, value]) => Boolean(value))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const requestUrl = `${path.join(QUORUM_API_ENDPOINT, QUORUM_API_BILL_ENDPOINT)}?${searchParams}`

  const response = await fetch(requestUrl)

  return response.json() as Promise<QuorumBillApiResponse>
}

export async function fetchQuorumBillSummaries(
  bills: QuorumBillApiObject[],
  paginationParams: PaginationParams,
) {
  const searchParams = Object.entries({
    limit: String(paginationParams.limit),
    offset: String(paginationParams.offset),

    bill__in: bills
      .map(bill => String(bill.id))
      .sort((a, b) => a.localeCompare(b))
      .join(','),

    ...QUORUM_API_AUTH_QUERY_PARAMS,
  })
    .filter(([_, value]) => Boolean(value))
    .map(([key, value]) => `${key}=${value!}`)
    .join('&')

  const requestUrl = `${path.join(QUORUM_API_ENDPOINT, QUORUM_API_BILL_SUMMARY_ENDPOINT)}?${searchParams}`

  const response = await fetch(requestUrl)

  return response.json() as Promise<QuorumBillSummaryApiResponse>
}

export function parseQuorumBillToBuilderIOPayload(
  bill: QuorumBillApiObject & { summaries: QuorumBillSummaryApiObject[] },
) {
  try {
    const response = {
      data: Object.fromEntries(
        Object.keys(resolveFields).map(key => [
          key,
          resolveFields[key as keyof typeof resolveFields](bill),
        ]),
      ) as SWCBillFromBuilderIO,
      name: `${BUILDER_IO_BILL_PREFIX ? `${BUILDER_IO_BILL_PREFIX} ` : ''}${bill.title}`,
    }

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    Sentry.captureException(errorMessage, {
      extra: {
        bill,
        error,
      },
      level: 'error',
      tags: {
        domain: 'StateLevelBillsCronJob',
      },
    })
    throw error
  }
}

export async function fetchBuilderIOBills(countryCode: SupportedCountryCodes) {
  let offset = 0

  function getNextEntries() {
    return getAllBillsWithOffset({ countryCode, offset, stateCode: undefined })
  }

  try {
    const entries = await getNextEntries()

    while (entries.length === QUORUM_API_BILLS_PER_PAGE + offset) {
      offset += entries.length
      const nextEntries = await getNextEntries()
      entries.push(...nextEntries)
    }

    return entries
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    Sentry.captureException(errorMessage, {
      extra: {
        countryCode,
        error,
        offset,
      },
      level: 'error',
      tags: {
        domain: 'StateLevelBillsCronJob',
      },
    })
    throw new Error(`Error fetching bills from Builder.io: ${errorMessage}`)
  }
}

export async function createBillEntryInBuilderIO(bill: CreateBillEntryPayload) {
  const body = JSON.stringify({
    ...bill,
    published: BUILDER_IO_BILL_PUBLISHED_STATE,
  })

  try {
    const response = await fetch(
      path.join(BUILDER_IO_WRITE_API_ENDPOINT, BuilderDataModelIdentifiers.BILLS),
      {
        body,
        headers: {
          Authorization: `Bearer ${BUILDER_IO_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    )

    if (!response.ok || response.status !== 200) {
      throw new Error('Unknown error')
    }

    const data = await response.json()

    return data as Promise<{ id: string }>
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    Sentry.captureException(errorMessage, {
      extra: {
        bill,
        error,
      },
      level: 'error',
      tags: {
        domain: 'StateLevelBillsCronJob',
      },
    })
    throw new Error(`Failed to create bill entry in Builder.io: ${errorMessage}.`)
  }
}

export async function updateBillEntryInBuilderIO(id: string, bill: UpdateBillEntryPayload) {
  const payload: Required<UpdateBillEntryPayload['data']> = {
    keyDates: bill.data.keyDates || [],
    summary: bill.data.summary,
    timelineDescription: bill.data.timelineDescription || '',
  }

  const body = JSON.stringify({
    data: payload,
    published: BUILDER_IO_BILL_PUBLISHED_STATE,
  })

  try {
    const response = await fetch(
      path.join(BUILDER_IO_WRITE_API_ENDPOINT, BuilderDataModelIdentifiers.BILLS, id),
      {
        body,
        headers: {
          Authorization: `Bearer ${BUILDER_IO_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      },
    )

    if (!response.ok || response.status !== 200) {
      throw new Error('Unknown error')
    }

    const data = await response.json()

    return data as Promise<{ id: string }>
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    Sentry.captureException(errorMessage, {
      extra: {
        bill,
        error,
        id,
        payload,
      },
      level: 'error',
      tags: {
        domain: 'StateLevelBillsCronJob',
      },
    })
    throw new Error(`Failed to update bill entry in Builder.io: ${errorMessage}.`)
  }
}
