import { partition, sortBy } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBillCard } from '@/components/app/dtsiBillCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SWCBillCardInfo } from '@/data/bills/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PageBillsProps {
  title: string
  description: string
  bills: SWCBillCardInfo[]
  countryCode: SupportedCountryCodes
}

const KEY_BILLS = ['HR3633', 'S1582', 'hr4763', 'hjres109', 'SJRES3', 'HJRES25', 'hr5403']

export function PageBills(props: PageBillsProps) {
  const { title, description, bills, countryCode } = props

  const [keyBills, otherBills] = partition(bills, bill => KEY_BILLS.includes(bill.dtsiSlug!))
  const sortedKeyBills = sortBy(keyBills, bill => KEY_BILLS.indexOf(bill.dtsiSlug!))

  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="space-y-7 text-center">
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>
      </section>

      {[
        { results: sortedKeyBills, sectionTitle: 'Key Bills' },
        { results: otherBills, sectionTitle: 'Other Crypto Bills' },
      ].map(({ results, sectionTitle }) => (
        <section key={sectionTitle}>
          <PageTitle as="h3" className="mb-5">
            {sectionTitle}
          </PageTitle>
          <div className="flex flex-col gap-4 lg:gap-8">
            {results.map(bill => (
              <DTSIBillCard bill={bill} countryCode={countryCode} key={bill.dtsiSlug}>
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
