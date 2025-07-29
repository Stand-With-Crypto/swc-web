import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { Timeline, TimelinePlotPoint } from '@/components/ui/timeline'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  BILL_CHAMBER_ORIGIN_OPTIONS,
  BILL_KEY_DATE_CATEGORY_OPTIONS,
  BILL_SUCCESSFUL_KEY_DATES,
  SWCBill,
  SWCBillKeyDate,
} from '@/utils/shared/zod/getSWCBills'

type BillTimelineFields = Pick<
  SWCBill,
  'chamberOrigin' | 'ctaButton' | 'keyDates' | 'timelineDescription'
>

type KeyDate = Omit<SWCBillKeyDate, 'date'>

interface TimeSectionProps {
  bill: BillTimelineFields
  countryCode: SupportedCountryCodes
}

type DefaultKeyDateName = 'passedLowerChamber' | 'passedUpperChamber' | 'presidentSigned'

const DEFAULT_KEY_DATES: Record<DefaultKeyDateName, KeyDate> = {
  passedLowerChamber: {
    category: BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_LOWER_CHAMBER,
    description: 'Passed House',
    isMajorMilestone: true,
    title: 'Passed House',
  },
  passedUpperChamber: {
    category: BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_UPPER_CHAMBER,
    description: 'Passed Senate',
    isMajorMilestone: true,
    title: 'Passed Senate',
  },
  presidentSigned: {
    category: BILL_KEY_DATE_CATEGORY_OPTIONS.PRESIDENT_SIGNED,
    description: 'President Signed',
    isMajorMilestone: true,
    title: 'President Signed',
  },
}

const DEFAULT_TIMELINES: Record<BILL_CHAMBER_ORIGIN_OPTIONS, KeyDate[]> = {
  [BILL_CHAMBER_ORIGIN_OPTIONS.LOWER_CHAMBER]: [
    DEFAULT_KEY_DATES.passedLowerChamber,
    DEFAULT_KEY_DATES.passedUpperChamber,
    DEFAULT_KEY_DATES.presidentSigned,
  ],
  [BILL_CHAMBER_ORIGIN_OPTIONS.UPPER_CHAMBER]: [
    DEFAULT_KEY_DATES.passedUpperChamber,
    DEFAULT_KEY_DATES.passedLowerChamber,
    DEFAULT_KEY_DATES.presidentSigned,
  ],
}

const KEY_DATE_CATEGORY_MAP: Partial<
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

function insertMissingTimelineDates(data: BillTimelineFields): TimelinePlotPoint[] {
  const billKeyDates = data.keyDates.map(keyDate => ({
    ...keyDate,
    isHighlighted: true,
    success: BILL_SUCCESSFUL_KEY_DATES.includes(keyDate.category),
  }))

  const missingKeyDates = DEFAULT_TIMELINES[data.chamberOrigin]
    .filter(({ category }) => KEY_DATE_CATEGORY_MAP[category]?.(billKeyDates))
    .map(keyDate => ({ ...keyDate, date: null, isHighlighted: false, success: true }))

  return [...billKeyDates, ...missingKeyDates]
}

export async function TimelineSection({ bill, countryCode }: TimeSectionProps) {
  const { ctaButton } = bill

  const keyDates = insertMissingTimelineDates(bill)

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-[#F2F5F9] p-6 font-sans">
      <header className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold">Current Status</h3>
          <p className="text-sm text-muted-foreground">
            {bill.timelineDescription ||
              'This bill is currently in the legislative process and has not yet been passed into law.'}
          </p>
        </div>

        {ctaButton && (
          <Button asChild variant="primary-cta">
            <InternalLink href={ctaButton.url}>{ctaButton.label}</InternalLink>
          </Button>
        )}
      </header>

      <Timeline countryCode={countryCode} plotPoints={keyDates} />
    </div>
  )
}
