import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { DTSI_BillCardFragment } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export type DTSIBill = DTSI_BillCardFragment

interface DTSIBillCardProps {
  bill: DTSIBill
  locale: SupportedLocale
  className?: string
}

export function DTSIBillCard(props: DTSIBillCardProps) {
  const { bill, locale, className } = props

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-3xl bg-secondary p-4 sm:flex-row sm:gap-6 sm:p-6',
        className,
      )}
      data-testid="bill-card"
    >
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          <InternalLink
            className="text-xl font-semibold text-primary "
            href={getIntlUrls(locale).billDetails(bill.id)}
          >
            <p className="line-clamp-3 text-xl font-semibold">{bill.shortTitle}</p>
          </InternalLink>
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

        <p className="line-clamp-2 text-justify">{bill.summary || bill.title}</p>
      </div>

      <Button asChild className="w-full sm:w-fit">
        <InternalLink href={getIntlUrls(locale).billDetails(bill.id)}>Learn More</InternalLink>
      </Button>
    </div>
  )
}
