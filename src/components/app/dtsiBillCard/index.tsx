import { ReactElement } from 'react'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { SWCBillCardInfo } from '@/data/bills/types'
import { DTSI_BillCardFragment } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export type DTSIBill = DTSI_BillCardFragment

interface BillInfo extends Pick<SWCBillCardInfo, 'title'> {
  billNumberOrDTSISlug?: string
  id?: string
}

interface DTSIBillCardProps {
  bill: BillInfo
  description?: string
  countryCode: SupportedCountryCodes
  children?: ReactElement<typeof CryptoSupportHighlight>
  className?: string
  title?: string
}

export function DTSIBillCard(props: DTSIBillCardProps) {
  const { bill, description, countryCode, children, className, title } = props

  const billTitle = title || bill.title

  const billSlug = bill.billNumberOrDTSISlug || bill.id || ''

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
          className={cn(linkBoxLinkClassName, 'line-clamp-3 text-xl font-semibold')}
          data-link-box-subject
          href={getIntlUrls(countryCode).billDetails(billSlug)}
        >
          {billTitle}
        </InternalLink>
        <p className="w-full max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap text-fontcolor-muted">
          {description}
        </p>
      </div>

      {children}
    </LinkBox>
  )
}
