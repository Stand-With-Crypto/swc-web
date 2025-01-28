import { ReactElement } from 'react'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { DTSI_BillCardFragment } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export type DTSIBill = DTSI_BillCardFragment

interface DTSIBillCardProps {
  bill: DTSIBill
  description?: string
  locale: SupportedLocale
  children: ReactElement<typeof CryptoSupportHighlight>
  className?: string
}

export function DTSIBillCard(props: DTSIBillCardProps) {
  const { bill, description, locale, children, className } = props

  return (
    <LinkBox
      className={cn(
        'flex flex-col items-center gap-x-6 gap-y-4 rounded-3xl bg-secondary p-6 hover:bg-secondary/80 md:flex-row md:justify-between',
        className,
      )}
      data-testid="bill-card"
    >
      <div className="max-md:text-center">
        <InternalLink
          className={cn(linkBoxLinkClassName, 'line-clamp-3 text-lg font-semibold')}
          data-link-box-subject
          href={getIntlUrls(locale).billDetails(bill.id)}
        >
          {bill.shortTitle || bill.title}
        </InternalLink>
        <p className="mt-2 text-fontcolor-muted">{description}</p>
      </div>

      {children}
    </LinkBox>
  )
}
