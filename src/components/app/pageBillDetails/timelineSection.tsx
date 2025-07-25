import { Timeline } from '@/components/app/pageBillDetails/timeline/timeline'
import { TimelinePlotPoint } from '@/components/app/pageBillDetails/timeline/types'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  BILL_CHAMBER_ORIGIN_OPTIONS,
  BILL_KEY_DATE_CATEGORY_OPTIONS,
  BILL_SUCCESSFUL_KEY_DATES,
  SWCBill,
  SWCBillKeyDate,
} from '@/utils/shared/zod/getSWCBills'

interface TimeSectionProps {
  bill: SWCBill
  countryCode: SupportedCountryCodes
}

const defaultKeyDates: Record<string, Omit<SWCBillKeyDate, 'date'>> = {
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

const defaultTimelines: Record<BILL_CHAMBER_ORIGIN_OPTIONS, Omit<SWCBillKeyDate, 'date'>[]> = {
  [BILL_CHAMBER_ORIGIN_OPTIONS.LOWER_CHAMBER]: [
    defaultKeyDates.passedLowerChamber,
    defaultKeyDates.passedUpperChamber,
    defaultKeyDates.presidentSigned,
  ],
  [BILL_CHAMBER_ORIGIN_OPTIONS.UPPER_CHAMBER]: [
    defaultKeyDates.passedUpperChamber,
    defaultKeyDates.passedLowerChamber,
    defaultKeyDates.presidentSigned,
  ],
}

function insertMissingTimelineDates(
  data: Pick<SWCBill, 'chamberOrigin' | 'keyDates'>,
): TimelinePlotPoint[] {
  const billKeyDates = data.keyDates.map(keyDate => ({
    ...keyDate,
    isHighlighted: true,
    success: BILL_SUCCESSFUL_KEY_DATES.includes(keyDate.category),
  }))

  const missingKeyDates = defaultTimelines[data.chamberOrigin]
    .filter(milestone => {
      switch (milestone.category) {
        case BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_LOWER_CHAMBER:
          return data.keyDates.every(
            keyDate =>
              ![
                BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_FAILED_LOWER_CHAMBER,
                BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_LOWER_CHAMBER,
              ].includes(keyDate.category),
          )
        case BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_UPPER_CHAMBER:
          return data.keyDates.every(
            keyDate =>
              ![
                BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_FAILED_UPPER_CHAMBER,
                BILL_KEY_DATE_CATEGORY_OPTIONS.BILL_PASSED_UPPER_CHAMBER,
              ].includes(keyDate.category),
          )
        case BILL_KEY_DATE_CATEGORY_OPTIONS.PRESIDENT_SIGNED:
          return data.keyDates.every(
            keyDate =>
              ![
                BILL_KEY_DATE_CATEGORY_OPTIONS.PRESIDENT_SIGNED,
                BILL_KEY_DATE_CATEGORY_OPTIONS.PRESIDENT_VETOED,
              ].includes(keyDate.category),
          )
        default:
          return false
      }
    })
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
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
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
