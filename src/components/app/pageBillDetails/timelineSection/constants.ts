import {
  BILL_CHAMBER_ORIGIN_OPTIONS,
  BILL_KEY_DATE_CATEGORY_OPTIONS,
  SWCBillKeyDate,
} from '@/utils/shared/zod/getSWCBills'

type KeyDate = Omit<SWCBillKeyDate, 'date'>

const DEFAULT_KEY_DATES: Record<Uppercase<string>, KeyDate> = {
  PASSED_LOWER_CHAMBER: {
    category: BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_LOWER_CHAMBER,
    description: 'Passed House',
    isMajorMilestone: true,
    title: 'Passed House',
  },
  PASSED_UPPER_CHAMBER: {
    category: BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_UPPER_CHAMBER,
    description: 'Passed Senate',
    isMajorMilestone: true,
    title: 'Passed Senate',
  },
  PRESIDENT_SIGNED: {
    category: BILL_KEY_DATE_CATEGORY_OPTIONS.PRESIDENT_SIGNED,
    description: 'President Signed',
    isMajorMilestone: true,
    title: 'President Signed',
  },
}

export const DEFAULT_TIMELINES: Record<BILL_CHAMBER_ORIGIN_OPTIONS, KeyDate[]> = {
  [BILL_CHAMBER_ORIGIN_OPTIONS.LOWER_CHAMBER]: [
    DEFAULT_KEY_DATES.PASSED_LOWER_CHAMBER,
    DEFAULT_KEY_DATES.PASSED_UPPER_CHAMBER,
    DEFAULT_KEY_DATES.PRESIDENT_SIGNED,
  ],
  [BILL_CHAMBER_ORIGIN_OPTIONS.UPPER_CHAMBER]: [
    DEFAULT_KEY_DATES.PASSED_UPPER_CHAMBER,
    DEFAULT_KEY_DATES.PASSED_LOWER_CHAMBER,
    DEFAULT_KEY_DATES.PRESIDENT_SIGNED,
  ],
}

export const KEY_DATE_CATEGORY_MAP: Partial<
  Record<BILL_KEY_DATE_CATEGORY_OPTIONS, (keyDates: SWCBillKeyDate[]) => boolean>
> = {
  [BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_LOWER_CHAMBER]: keyDates =>
    keyDates.every(
      keyDate =>
        ![
          BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_FAILED_LOWER_CHAMBER,
          BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_LOWER_CHAMBER,
        ].includes(keyDate.category),
    ),
  [BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_UPPER_CHAMBER]: keyDates =>
    keyDates.every(
      keyDate =>
        ![
          BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_FAILED_UPPER_CHAMBER,
          BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_UPPER_CHAMBER,
        ].includes(keyDate.category),
    ),
  [BILL_KEY_DATE_CATEGORY_OPTIONS.PRESIDENT_SIGNED]: keyDates =>
    keyDates.every(
      keyDate =>
        ![
          BILL_KEY_DATE_CATEGORY_OPTIONS.PRESIDENT_SIGNED,
          BILL_KEY_DATE_CATEGORY_OPTIONS.PRESIDENT_VETOED,
        ].includes(keyDate.category),
    ),
}
