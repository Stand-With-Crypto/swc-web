import { partition, sortBy } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBill, DTSIBillCard } from '@/components/app/dtsiBillCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

interface PageBillsProps {
  title: string
  description: string
  bills: DTSIBill[]
  locale: SupportedLocale
}

const KEY_BILLS = ['hr4763', 'hjres109', 'hr5403']

export function PageBills(props: PageBillsProps) {
  const { title, description, bills, locale } = props

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
              <DTSIBillCard bill={bill} key={bill.id} locale={locale}>
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
