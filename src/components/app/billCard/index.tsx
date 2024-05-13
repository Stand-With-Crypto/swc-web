import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DTSI_BillCardFragment } from '@/data/dtsi/generated'
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { cn } from '@/utils/web/cn'

export type Bill = DTSI_BillCardFragment

interface BillCardProps {
  bill: Bill
  className?: string
}

export function BillCard(props: BillCardProps) {
  const { bill, className } = props

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-3xl bg-secondary p-6 md:flex-row lg:gap-6',
        className,
      )}
      data-test-id="policy-card"
    >
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          <span className="text-xl font-semibold">{bill.shortTitle}</span>
          <div className="flex flex-wrap gap-2 uppercase">
            <Badge variant="gray">{bill.status}</Badge>
            <Badge
              variant={
                bill.computedStanceScore === 50
                  ? 'gray'
                  : Number(bill.computedStanceScore) > 50
                    ? 'green'
                    : 'red'
              }
            >
              {convertDTSIStanceScoreToCryptoSupportLanguage(bill.computedStanceScore)}
            </Badge>
          </div>
        </div>

        <p className="line-clamp-2 text-justify">{bill.summary}</p>
      </div>

      <Button className="max-md:w-full">Learn More</Button>
    </div>
  )
}
