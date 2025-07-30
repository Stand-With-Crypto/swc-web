import { partition, sortBy } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBillCard } from '@/components/app/dtsiBillCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SWCBillCardInfo } from '@/data/bills/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface PageBillsProps {
  bills: SWCBillCardInfo[]
  countryCode: SupportedCountryCodes
  description?: string
  title?: string
}

export function PageBills({ bills, countryCode, description, title }: PageBillsProps) {
  const hasWrapper = title && description

  const [keyBills, otherBills] = partition(bills, bill => bill.isKeyBill)
  const sortedKeyBills = sortBy(keyBills, bill => bill.dateIntroduced, 'desc')

  const data = [
    { results: sortedKeyBills, sectionTitle: 'Key Bills' },
    { results: otherBills, sectionTitle: 'Other Crypto Bills' },
  ].filter(({ results }) => results.length > 0)

  return (
    <div className={cn('container space-y-16', { 'standard-spacing-from-navbar': hasWrapper })}>
      {hasWrapper && (
        <section className="space-y-7 text-center">
          <PageTitle>{title}</PageTitle>
          <PageSubTitle>{description}</PageSubTitle>
        </section>
      )}

      {data.map(({ results, sectionTitle }) => (
        <section key={sectionTitle}>
          {data.length > 1 && (
            <PageTitle as="h3" className="mb-5">
              {sectionTitle}
            </PageTitle>
          )}
          <div className="flex flex-col gap-4 lg:gap-8">
            {results.map(bill => (
              <DTSIBillCard bill={bill} countryCode={countryCode} key={bill.billNumberOrDTSISlug}>
                <CryptoSupportHighlight
                  className="flex-shrink-0 rounded-full text-base"
                  stanceScore={bill.computedStanceScore}
                />
              </DTSIBillCard>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
