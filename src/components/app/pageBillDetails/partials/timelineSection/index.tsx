import { DEFAULT_TIMELINES, KEY_DATE_CATEGORY_MAP } from './constants'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { Timeline, TimelinePlotPoint } from '@/components/ui/timeline'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { BILL_SUCCESSFUL_KEY_DATES, SWCBill } from '@/utils/shared/zod/getSWCBills'

type BillTimelineFields = Pick<
  SWCBill,
  'chamberOrigin' | 'ctaButton' | 'keyDates' | 'timelineDescription'
>

interface TimeSectionProps {
  bill: BillTimelineFields
  countryCode: SupportedCountryCodes
}

function insertMissingTimelineDates(data: BillTimelineFields): TimelinePlotPoint[] {
  const billKeyDates = data.keyDates.map(keyDate => ({
    ...keyDate,
    isHighlighted: true,
    success: BILL_SUCCESSFUL_KEY_DATES.includes(keyDate.category),
  }))

  const missingKeyDates = DEFAULT_TIMELINES[data.chamberOrigin]
    .filter(({ category }) => KEY_DATE_CATEGORY_MAP[category]?.(billKeyDates))
    .map(keyDate => ({
      ...keyDate,
      date: null,
      isHighlighted: false,
      success: true,
    }))

  return [...billKeyDates, ...missingKeyDates].map((keyDate, index) => ({
    ...keyDate,
    id: index,
  }))
}

export async function TimelineSection({ bill, countryCode }: TimeSectionProps) {
  const { ctaButton } = bill

  const keyDates = insertMissingTimelineDates(bill)

  return (
    <div className="container mb-20 flex flex-col gap-6 rounded-3xl bg-[#F2F5F9] p-6 font-sans sm:mb-28">
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
