import { orderBy } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { TimelineSection } from '@/components/app/pageBillDetails/timelineSection'
import { VotesSection } from '@/components/app/pageBillDetails/votesSection'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCBill } from '@/utils/shared/zod/getSWCBills'

interface PageBillDetailsProps {
  bill: SWCBill
  countryCode: SupportedCountryCodes
}

export function PageBillDetails(props: PageBillDetailsProps) {
  const { bill, countryCode } = props

  const relationships = orderBy(bill.relationships, x => x.person.firstName)

  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="space-y-8 text-center">
        <PageTitle size="sm">{bill.title}</PageTitle>
        <PageSubTitle>{bill.summary}</PageSubTitle>
        <p className="font-semibold">
          <FormattedDatetime
            date={new Date(bill.dateIntroduced)}
            dateStyle="medium"
            locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
          />
        </p>
        <ExternalLink className="inline-block" href={bill.officialBillUrl}>
          {bill.officialBillUrl}
        </ExternalLink>
        <CryptoSupportHighlight className="mx-auto" stanceScore={bill.computedStanceScore} />
      </section>

      <TimelineSection bill={bill} countryCode={countryCode} />

      {bill.analysis && (
        <section className="space-y-8 text-center">
          <p className="text-lg font-semibold">Analysis</p>

          <div className="space-y-6 text-center text-fontcolor-muted">
            {/**
             * @todo: Replace with the following component <RichTextFormatter richText={bill.analysis} />
             */}
            {bill.analysis}
          </div>
        </section>
      )}

      <VotesSection countryCode={countryCode} votes={relationships} />
    </div>
  )
}
