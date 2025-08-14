import {
  BillChamberOrigin,
  BillKeyDateCategory,
  SWCBillKeyDate,
} from '@/utils/shared/zod/getSWCBills'

type KeyDate = Omit<SWCBillKeyDate, 'date'>

const DEFAULT_KEY_DATES: Record<Uppercase<string>, KeyDate> = {
  PASSED_LOWER_CHAMBER: {
    category: BillKeyDateCategory.BILL_PASSED_LOWER_CHAMBER,
    description: 'Passed House',
    isMajorMilestone: true,
    title: 'Passed House',
  },
  PASSED_UPPER_CHAMBER: {
    category: BillKeyDateCategory.BILL_PASSED_UPPER_CHAMBER,
    description: 'Passed Senate',
    isMajorMilestone: true,
    title: 'Passed Senate',
  },
  PRESIDENT_SIGNED: {
    category: BillKeyDateCategory.PRESIDENT_SIGNED,
    description: 'President Signed',
    isMajorMilestone: true,
    title: 'President Signed',
  },
}

export const DEFAULT_TIMELINES: Record<BillChamberOrigin, KeyDate[]> = {
  [BillChamberOrigin.LOWER_CHAMBER]: [
    DEFAULT_KEY_DATES.PASSED_LOWER_CHAMBER,
    DEFAULT_KEY_DATES.PASSED_UPPER_CHAMBER,
    DEFAULT_KEY_DATES.PRESIDENT_SIGNED,
  ],
  [BillChamberOrigin.UPPER_CHAMBER]: [
    DEFAULT_KEY_DATES.PASSED_UPPER_CHAMBER,
    DEFAULT_KEY_DATES.PASSED_LOWER_CHAMBER,
    DEFAULT_KEY_DATES.PRESIDENT_SIGNED,
  ],
}

export const KEY_DATE_CATEGORY_MAP: Partial<
  Record<BillKeyDateCategory, (keyDates: SWCBillKeyDate[]) => boolean>
> = {
  [BillKeyDateCategory.BILL_PASSED_LOWER_CHAMBER]: keyDates =>
    keyDates.every(
      keyDate =>
        ![
          BillKeyDateCategory.BILL_FAILED_LOWER_CHAMBER,
          BillKeyDateCategory.BILL_PASSED_LOWER_CHAMBER,
        ].includes(keyDate.category),
    ),
  [BillKeyDateCategory.BILL_PASSED_UPPER_CHAMBER]: keyDates =>
    keyDates.every(
      keyDate =>
        ![
          BillKeyDateCategory.BILL_FAILED_UPPER_CHAMBER,
          BillKeyDateCategory.BILL_PASSED_UPPER_CHAMBER,
        ].includes(keyDate.category),
    ),
  [BillKeyDateCategory.PRESIDENT_SIGNED]: keyDates =>
    keyDates.every(
      keyDate =>
        ![BillKeyDateCategory.PRESIDENT_SIGNED, BillKeyDateCategory.PRESIDENT_VETOED].includes(
          keyDate.category,
        ),
    ),
}
