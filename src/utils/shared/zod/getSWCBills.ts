import { array, boolean, nativeEnum, object, string, z } from 'zod'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export enum BILL_CHAMBER_ORIGIN_OPTIONS {
  LOWER_CHAMBER = 'Lower Chamber',
  UPPER_CHAMBER = 'Upper Chamber',
}

export enum BILL_KEY_DATE_CATEGORY_OPTIONS {
  BILL_FAILED_LOWER_CHAMBER = 'Bill failed lower chamber',
  BILL_FAILED_LOWER_CHAMBER_COMMITTEE = 'Bill failed lower chamber committee',
  BILL_FAILED_UPPER_CHAMBER = 'Bill failed upper chamber',
  BILL_FAILED_UPPER_CHAMBER_COMMITTEE = 'Bill failed upper chamber committee',
  BILL_INTRODUCED_LOWER_CHAMBER = 'Bill introduced lower chamber',
  BILL_INTRODUCED_UPPER_CHAMBER = 'Bill introduced upper chamber',
  BILL_PASSED_LOWER_CHAMBER = 'Bill passed lower chamber',
  BILL_PASSED_LOWER_CHAMBER_COMMITTEE = 'Bill passed lower chamber committee',
  BILL_PASSED_UPPER_CHAMBER = 'Bill passed upper chamber',
  BILL_PASSED_UPPER_CHAMBER_COMMITTEE = 'Bill passed upper chamber committee',
  OTHER = 'Other',
  PRESIDENT_SIGNED = 'President signed',
  PRESIDENT_VETOED = 'President vetoed',
}

export const BILL_SUCCESSFUL_KEY_DATES: BILL_KEY_DATE_CATEGORY_OPTIONS[] = [
  BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_INTRODUCED_LOWER_CHAMBER,
  BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_INTRODUCED_UPPER_CHAMBER,
  BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_LOWER_CHAMBER_COMMITTEE,
  BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_LOWER_CHAMBER,
  BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_UPPER_CHAMBER_COMMITTEE,
  BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_UPPER_CHAMBER,
  BILL_KEY_DATE_CATEGORY_OPTIONS.OTHER,
  BILL_KEY_DATE_CATEGORY_OPTIONS.PRESIDENT_SIGNED,
]

export const zodBillSchemaValidation = object({
  data: object({
    analysis: string(),
    auAdministrativeAreaLevel1: string().min(2).max(3).optional(),
    billNumber: string(),
    caAdministrativeAreaLevel1: string().min(2).max(3).optional(),
    chamberOrigin: nativeEnum(BILL_CHAMBER_ORIGIN_OPTIONS),
    countryCode: string().length(2),
    ctaButton: object({
      label: string(),
      url: string().url(),
    }).partial(),
    dateIntroduced: string(),
    dtsiSlug: string().optional(),
    gbAdministrativeAreaLevel1: string().min(2).max(3).optional(),
    isKeyBill: boolean(),
    keyDates: array(
      object({
        date: string(),
        title: string(),
        description: string(),
        isMajorMilestone: boolean().optional(),
        category: nativeEnum(BILL_KEY_DATE_CATEGORY_OPTIONS),
      }),
    ).optional(),
    officialBillUrl: string().url(),
    relatedUrls: array(
      object({
        title: string(),
        url: string().url(),
      }),
    ).optional(),
    summary: string(),
    timelineDescription: string().optional(),
    title: string(),
    usAdministrativeAreaLevel1: string().min(2).max(3).optional(),
  }),
})

export type SWCBillFromBuilderIO = z.infer<typeof zodBillSchemaValidation>['data']

export interface SWCBillKeyDate {
  category: BILL_KEY_DATE_CATEGORY_OPTIONS
  date: string
  description: string
  isMajorMilestone: boolean
  title: string
}

export interface SWCBillCTAButton {
  label: string
  url: string
}

export interface SWCBill {
  administrativeAreaLevel1?: string
  analysis: string
  auAdministrativeAreaLevel1?: string
  billNumber: string
  caAdministrativeAreaLevel1?: string
  chamberOrigin: BILL_CHAMBER_ORIGIN_OPTIONS
  computedStanceScore?: number | null
  countryCode: SupportedCountryCodes
  ctaButton?: SWCBillCTAButton
  dateIntroduced: string
  dtsiSlug?: string
  gbAdministrativeAreaLevel1?: string
  isKeyBill: boolean
  keyDates: SWCBillKeyDate[]
  officialBillUrl: string
  relatedUrls: {
    title: string
    url: string
  }[]
  summary: string
  timelineDescription?: string
  title: string
  usAdministrativeAreaLevel1?: string
}
