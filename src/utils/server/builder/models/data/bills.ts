import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  BILL_CHAMBER_ORIGIN_OPTIONS,
  BILL_KEY_DATE_CATEGORY_OPTIONS,
  SWCBill,
  SWCBillFromBuilderIO,
  SWCBillsFromBuilderIO,
  zodBillSchemaValidation,
} from '@/utils/shared/zod/getSWCBills'

const logger = getLogger(`builderIOEvents`)

const isProduction = NEXT_PUBLIC_ENVIRONMENT === 'production'

export async function getBillFromBuilderIO(dtsiSlug: string): Promise<SWCBill | null> {
  try {
    const entry = await pRetry(
      () =>
        builderSDKClient.get(BuilderDataModelIdentifiers.BILLS, {
          query: {
            data: {
              dtsiSlug,
            },
            ...(isProduction && { published: 'published' }),
          },
          includeUnpublished: !isProduction,
          cacheSeconds: 60,
        }),
      {
        retries: 3,
        minTimeout: 5000,
      },
    )

    const parsedEntry = zodBillSchemaValidation.safeParse(entry)

    if (!parsedEntry.success) {
      return null
    }

    return parseBillEntryFromBuilderIO(parsedEntry.data.data)
  } catch (error) {
    logger.error('error getting single bill:' + error)
    Sentry.captureException(error, {
      level: 'error',
      tags: { domain: 'getBill' },
    })
    return null
  }
}

const LIMIT = 100

async function getAllBillsWithOffset({
  offset,
  countryCode,
}: {
  offset: number
  countryCode: SupportedCountryCodes
}): Promise<SWCBillsFromBuilderIO> {
  return (await pRetry(
    () =>
      builderSDKClient.getAll(BuilderDataModelIdentifiers.BILLS, {
        query: {
          ...(isProduction && { published: 'published' }),
          data: {
            countryCode: countryCode.toUpperCase(),
          },
        },
        includeUnpublished: !isProduction,
        cacheSeconds: 60,
        limit: LIMIT,
        offset,
      }),
    {
      retries: 3,
      minTimeout: 10000,
    },
  )) as SWCBillsFromBuilderIO
}

export async function getBillsFromBuilderIO({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}): Promise<SWCBill[]> {
  try {
    let offset = 0

    const entries = await getAllBillsWithOffset({ offset, countryCode })

    while (entries.length === LIMIT + offset) {
      offset += entries.length
      entries.push(...(await getAllBillsWithOffset({ offset, countryCode })))
    }

    const filteredIncompleteBills = entries
      .map(entry => {
        const validEntry = zodBillSchemaValidation.safeParse(entry)
        return validEntry.success ? validEntry.data : null
      })
      .filter(Boolean) as SWCBillsFromBuilderIO

    if (filteredIncompleteBills.length === 0) {
      return []
    }

    return filteredIncompleteBills.map(bill => parseBillEntryFromBuilderIO(bill.data))
  } catch (error) {
    logger.error('error getting all bills:' + error)
    Sentry.captureException(error, {
      level: 'error',
      tags: { domain: 'builder.io', model: 'bills' },
    })
    return []
  }
}

function parseBillEntryFromBuilderIO(bill: SWCBillFromBuilderIO): SWCBill {
  return {
    ...bill,
    administrativeAreaLevel1:
      bill.auAdministrativeAreaLevel1 ||
      bill.caAdministrativeAreaLevel1 ||
      bill.gbAdministrativeAreaLevel1 ||
      bill.usAdministrativeAreaLevel1,
    isKeyBill: bill.isKeyBill ?? false,
    keyDates: [
      {
        category:
          bill.chamberOrigin === BILL_CHAMBER_ORIGIN_OPTIONS.LOWER_CHAMBER
            ? BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_INTRODUCED_LOWER_CHAMBER
            : BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_INTRODUCED_UPPER_CHAMBER,
        date: bill.dateIntroduced,
        description:
          'The bill was introduced to the assembly, setting the stage for further discussion and consideration.',
        isMajorMilestone: true,
        title: 'Bill Introduced',
      },
      ...(bill.keyDates || []).map(keyDate => ({
        ...keyDate,
        isMajorMilestone: keyDate.isMajorMilestone ?? false,
      })),
    ],
    relatedUrls: bill.relatedUrls || [],
  }
}
