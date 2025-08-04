import { BillDetails } from '@/data/bills/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { Analysis } from './partials/analysis'
import { Header } from './partials/header'
import { VotesSection } from './partials/voteSection'

interface PageBillDetailsProps {
  bill: BillDetails
  countryCode: SupportedCountryCodes
}

export function PageBillDetails(props: PageBillDetailsProps) {
  const { bill, countryCode } = props

  return (
    <section className="standard-spacing-from-navbar mt-10 md:mt-28">
      <Header bill={bill} countryCode={countryCode} />

      {bill.analysis && <Analysis analysis={bill.analysis} relatedUrls={bill.relatedUrls} />}

      <VotesSection countryCode={countryCode} relationships={bill.relationships} />
    </section>
  )
}
