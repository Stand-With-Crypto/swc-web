import { orderBy } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { RichTextFormatter } from '@/components/app/dtsiRichText/dtsiRichTextFormatter'
import { RichTextEditorValue } from '@/components/app/dtsiRichText/types'
import { VotesSection } from '@/components/app/pageBillDetails/votesSection'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { ExternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PageBillDetailsProps {
  bill: DTSIBillDetails
  countryCode: SupportedCountryCodes
}

export function PageBillDetails(props: PageBillDetailsProps) {
  const { bill, countryCode } = props

  const analyses = bill.analysis.filter(
    analysis =>
      analysis.richTextCommentary &&
      (analysis.richTextCommentary as RichTextEditorValue).length > 0,
  )
  const relationships = orderBy(bill.relationships, x => x.person.firstName)

  return (
    <div className="standard-spacing-from-navbar container mt-[120px]">
      <section className="space-y-8 text-center">
        <div>
          <PageTitle size="xlg">{bill.shortTitle || bill.title}</PageTitle>
          <p className="mb-8 mt-2 font-semibold text-gray-600">
            <FormattedDatetime
              date={new Date(bill.dateIntroduced)}
              dateStyle="medium"
              locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
            />
          </p>
          <CryptoSupportHighlight className="mx-auto" stanceScore={bill.computedStanceScore} />

          <p className="mt-10 text-lg text-gray-600">{bill.summary || bill.title}</p>
        </div>
        <ExternalLink className="inline-block" href={bill.congressDotGovUrl}>
          {bill.congressDotGovUrl}
        </ExternalLink>
      </section>

      {!!analyses.length && (
        <section className="space-y-8 text-center">
          <p className="text-lg font-semibold">Analysis</p>

          <div className="space-y-6 text-center text-fontcolor-muted">
            {analyses.map(analysis => (
              <div className="space-y-2" key={analysis.id}>
                <RichTextFormatter richText={analysis.richTextCommentary} />
              </div>
            ))}
          </div>
        </section>
      )}

      <VotesSection countryCode={countryCode} votes={relationships} />
    </div>
  )
}
