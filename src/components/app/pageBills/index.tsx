import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBill, DTSIBillCard } from '@/components/app/dtsiBillCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedLocale } from '@/intl/locales'

interface PageBillsProps {
  title: string
  description: string
  bills: DTSIBill[]
  locale: SupportedLocale
}

export function PageBills(props: PageBillsProps) {
  const { title, description, bills, locale } = props

  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="space-y-7 text-center">
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>
      </section>

      <section>
        <div className="flex flex-col gap-4 lg:gap-8">
          {bills.map(bill => (
            <DTSIBillCard bill={bill} key={bill.id} locale={locale}>
              <CryptoSupportHighlight
                className="flex-shrink-0 rounded-full text-base"
                stanceScore={bill.computedStanceScore}
              />
            </DTSIBillCard>
          ))}
        </div>
      </section>
    </div>
  )
}
