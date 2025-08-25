import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  BillChamberOrigin,
  BillKeyDateCategory,
  SWCBill,
  SWCBillCTAButton,
  SWCBillFromBuilderIO,
  zodBillSchemaValidation,
} from '@/utils/shared/zod/getSWCBills'

const logger = getLogger(`builderIOEvents`)

const isProduction = NEXT_PUBLIC_ENVIRONMENT === 'production'

interface BillFilters {
  billNumber?: string
  countryCode: SupportedCountryCodes
  dtsiSlug?: string
}

async function getBillFromBuilderIO(filters: BillFilters): Promise<SWCBill | null> {
  try {
    if (!filters.billNumber && !filters.dtsiSlug) {
      throw new Error("You must provide either 'billNumber' or 'dtsiSlug'.")
    }

    const entry = await pRetry(
      () =>
        builderSDKClient.get(BuilderDataModelIdentifiers.BILLS, {
          query: {
            data: {
              ...filters,
              countryCode: filters.countryCode.toUpperCase(),
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

export function getBillFromBuilderIOByBillNumber(
  countryCode: SupportedCountryCodes,
  billNumber: string,
) {
  return getBillFromBuilderIO({
    countryCode,
    billNumber,
  })
}

export function getBillFromBuilderIOByDTSISlug(
  countryCode: SupportedCountryCodes,
  dtsiSlug: string,
) {
  return getBillFromBuilderIO({
    countryCode,
    dtsiSlug,
  })
}

const LIMIT = 100

function getAllBillsWithOffset({
  countryCode,
  offset,
  stateCode,
}: {
  countryCode: SupportedCountryCodes
  offset: number
  stateCode?: string
}) {
  const filterByCountryCode = { countryCode: countryCode.toUpperCase() }

  const stateFilterKeys = [
    'auAdministrativeAreaLevel1',
    'caAdministrativeAreaLevel1',
    'gbAdministrativeAreaLevel1',
    'usAdministrativeAreaLevel1',
  ]
  const stateFilter = stateFilterKeys.map(key => ({
    ...filterByCountryCode,
    [key]: { $eq: stateCode?.toUpperCase() },
  }))
  const filterByStateCode = {
    $or: stateFilter,
  }

  return pRetry(
    () =>
      builderSDKClient.getAll(BuilderDataModelIdentifiers.BILLS, {
        query: {
          ...(isProduction && { published: 'published' }),
          data: stateCode ? filterByStateCode : filterByCountryCode,
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
  ) as Promise<SWCBillFromBuilderIO[]>
}

export async function getBillsFromBuilderIO({
  countryCode,
  stateCode,
}: {
  countryCode: SupportedCountryCodes
  stateCode?: string
}): Promise<SWCBill[]> {
  try {
    let offset = 0

    const entries = await getAllBillsWithOffset({ countryCode, offset, stateCode })

    while (entries.length === LIMIT + offset) {
      offset += entries.length
      entries.push(...(await getAllBillsWithOffset({ countryCode, offset, stateCode })))
    }

    const filteredIncompleteBills = entries
      .map(entry => {
        const validEntry = zodBillSchemaValidation.safeParse(entry)
        return validEntry.success ? validEntry.data : null
      })
      .filter(Boolean) as { data: SWCBillFromBuilderIO }[]

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
  const billIntroductionCategoryMap: Record<BillChamberOrigin, BillKeyDateCategory> = {
    [BillChamberOrigin.LOWER_CHAMBER]: BillKeyDateCategory.BILL_INTRODUCED_LOWER_CHAMBER,
    [BillChamberOrigin.UPPER_CHAMBER]: BillKeyDateCategory.BILL_INTRODUCED_UPPER_CHAMBER,
  }

  return {
    ...bill,
    administrativeAreaLevel1:
      bill.auAdministrativeAreaLevel1 ||
      bill.caAdministrativeAreaLevel1 ||
      bill.gbAdministrativeAreaLevel1 ||
      bill.usAdministrativeAreaLevel1,
    countryCode: bill.countryCode.toUpperCase() as SupportedCountryCodes,
    ctaButton:
      bill.ctaButton.label && bill.ctaButton.url ? (bill.ctaButton as SWCBillCTAButton) : undefined,
    isKeyBill: bill.isKeyBill ?? false,
    keyDates: [
      {
        category: billIntroductionCategoryMap[bill.chamberOrigin],
        date: bill.dateIntroduced,
        description: 'Bill Introduced',
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
