import { array, boolean, nativeEnum, object, string, z } from 'zod'

import { DTSIBill } from '@/components/app/dtsiBillCard'

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
    title: string(),
    summary: string(),
    billNumber: string(),
    dtsiSlug: string().optional(),
    dateIntroduced: string(),
    chamberOrigin: nativeEnum(BILL_CHAMBER_ORIGIN_OPTIONS),
    officialBillUrl: string().url(),
    analysis: string(),
    relatedUrls: array(
      object({
        title: string(),
        url: string().url(),
      }),
    ),
    keyDates: array(
      object({
        date: string(),
        title: string(),
        description: string(),
        isMajorMilestone: boolean().optional(),
        category: nativeEnum(BILL_KEY_DATE_CATEGORY_OPTIONS),
      }),
    ).optional(),
    ctaButton: object({
      label: string(),
      url: string().url(),
    }),
    isKeyBill: boolean(),
    countryCode: string().length(2),
    auAdministrativeAreaLevel1: string().min(2).max(3).optional(),
    caAdministrativeAreaLevel1: string().min(2).max(3).optional(),
    gbAdministrativeAreaLevel1: string().min(2).max(3).optional(),
    usAdministrativeAreaLevel1: string().min(2).max(3).optional(),
  }),
})

export type SWCBillsFromBuilderIO = z.infer<typeof zodBillSchemaValidation>[]

export type SWCBillFromBuilderIO = SWCBillsFromBuilderIO[number]['data']

export type SWCBill = Omit<SWCBillsFromBuilderIO[number]['data'], 'keyDates'> & {
  administrativeAreaLevel1?: string
  keyDates: Required<SWCBillsFromBuilderIO[number]['data']['keyDates']>
} & Partial<Pick<DTSIBill, 'computedStanceScore'>>
