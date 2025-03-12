import { partition, sortBy } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBill, DTSIBillCard } from '@/components/app/dtsiBillCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PageBillsProps {
  title: string
  description: string
  bills: DTSIBill[]
  countryCode: SupportedCountryCodes
}

const KEY_BILLS = ['hr4763', 'hjres109', 'hr5403', 'SJRES3', 'HJRES25']

export function PageBills(props: PageBillsProps) {
  const { title, description, bills, countryCode } = props

  const [keyBills, otherBills] = partition(bills, bill => KEY_BILLS.includes(bill.slug))
  const sortedKeyBills = sortBy(keyBills, bill => KEY_BILLS.indexOf(bill.slug))

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
              <DTSIBillCard bill={bill} countryCode={countryCode} key={bill.id}>
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
