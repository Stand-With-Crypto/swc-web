import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { array, boolean, nativeEnum, object, string, z } from 'zod'

export enum BILL_CHAMBER_ORIGIN_OPTIONS {
  LOWER_CHAMBER = 'Lower Chamber',
  UPPER_CHAMBER = 'Upper Chamber',
}

export enum BILL_KEY_DATE_CATEGORY_OPTIONS {
  BILL_INTRODUCED_LOWER_CHAMBER = 'BILL_INTRODUCED_LOWER_CHAMBER',
  BILL_PASSED_LOWER_CHAMBER_COMMITTEE = 'BILL_PASSED_LOWER_CHAMBER_COMMITTEE',
  BILL_FAILED_LOWER_CHAMBER_COMMITTEE = 'BILL_FAILED_LOWER_CHAMBER_COMMITTEE',
  BILL_PASSED_LOWER_CHAMBER = 'BILL_PASSED_LOWER_CHAMBER',
  BILL_FAILED_LOWER_CHAMBER = 'BILL_FAILED_LOWER_CHAMBER',
  BILL_INTRODUCED_UPPER_CHAMBER = 'BILL_INTRODUCED_UPPER_CHAMBER',
  BILL_PASSED_UPPER_CHAMBER_COMMITTEE = 'BILL_PASSED_UPPER_CHAMBER_COMMITTEE',
  BILL_FAILED_UPPER_CHAMBER_COMMITTEE = 'BILL_FAILED_UPPER_CHAMBER_COMMITTEE',
  BILL_PASSED_UPPER_CHAMBER = 'BILL_PASSED_UPPER_CHAMBER',
  BILL_FAILED_UPPER_CHAMBER = 'BILL_FAILED_UPPER_CHAMBER',
  PRESIDENT_SIGNED = 'PRESIDENT_SIGNED',
  PRESIDENT_VETOED = 'PRESIDENT_VETOED',
}

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
    }).optional(),
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
    ),
    summary: string(),
    title: string(),
    usAdministrativeAreaLevel1: string().min(2).max(3).optional(),
  }),
})

export type SWCBillFromBuilderIO = z.infer<typeof zodBillSchemaValidation>['data']

export type SWCBill = {
  administrativeAreaLevel1?: string
  analysis: string
  auAdministrativeAreaLevel1?: string
  billNumber: string
  caAdministrativeAreaLevel1?: string
  chamberOrigin: BILL_CHAMBER_ORIGIN_OPTIONS
  computedStanceScore?: number | null
  countryCode: SupportedCountryCodes
  ctaButton?: {
    url: string
    label: string
  }
  dateIntroduced: string
  dtsiSlug?: string
  gbAdministrativeAreaLevel1?: string
  isKeyBill: boolean
  keyDates: {
    category: BILL_KEY_DATE_CATEGORY_OPTIONS
    date: string
    description: string
    isMajorMilestone: boolean
    title: string
  }[]
  officialBillUrl: string
  relatedUrls: {
    title: string
    url: string
  }[]
  summary: string
  title: string
  usAdministrativeAreaLevel1?: string
}
