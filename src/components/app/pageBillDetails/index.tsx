import { orderBy } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { VotesSection } from '@/components/app/pageBillDetails/votesSection'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { PageTitle } from '@/components/ui/pageTitleText'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCBill } from '@/utils/shared/zod/getSWCBills'
import { RichTextFormatter } from '@/components/app/dtsiRichText/dtsiRichTextFormatter'

interface PageBillDetailsProps {
  bill: SWCBill
  countryCode: SupportedCountryCodes
}

export function PageBillDetails(props: PageBillDetailsProps) {
  const { bill, countryCode } = props

  const relationships = orderBy(bill.relationships, x => x.person.firstName)

  return (
    <div className="standard-spacing-from-navbar container mt-[120px]">
      <section className="space-y-8 text-center">
        <div>
          <PageTitle size="xlg">{bill.title}</PageTitle>
          <p className="mb-8 mt-2 font-semibold text-gray-600">
            <FormattedDatetime
              date={new Date(bill.dateIntroduced)}
              dateStyle="medium"
              locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
            />
          </p>
          <CryptoSupportHighlight className="mx-auto" stanceScore={bill.computedStanceScore} />

          <div
            className="my-10 text-lg text-gray-600"
            dangerouslySetInnerHTML={{ __html: bill.summary }}
          />
        </div>
      </section>

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
