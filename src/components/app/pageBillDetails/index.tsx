import { orderBy } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { RichTextFormatter } from '@/components/app/dtsiRichText/dtsiRichTextFormatter'
import { RichTextEditorValue } from '@/components/app/dtsiRichText/types'
import { VotesSection } from '@/components/app/pageBillDetails/votesSection'
import { Button } from '@/components/ui/button'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
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
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="space-y-8 text-center">
        <PageTitle size="sm">{bill.shortTitle || bill.title}</PageTitle>
        <PageSubTitle>
          {
            // Some bills don't have a summary but have a really long title, so we use the title as a fallback
            bill.summary || bill.title
          }
        </PageSubTitle>
        <p className="font-semibold">
          <FormattedDatetime
            date={new Date(bill.dateIntroduced)}
            dateStyle="medium"
            locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
          />
        </p>
        <ExternalLink className="inline-block" href={bill.congressDotGovUrl}>
          {bill.congressDotGovUrl}
        </ExternalLink>
        <CryptoSupportHighlight className="mx-auto" stanceScore={bill.computedStanceScore} />
      </section>

      <section className="space-y-8 text-center">
        <p className="text-lg font-semibold">Analysis</p>

        <div className="space-y-6 text-center text-fontcolor-muted">
          {analyses.length ? (
            analyses.map(analysis => (
              <div className="space-y-2" key={analysis.id}>
                <RichTextFormatter richText={analysis.richTextCommentary} />
              </div>
            ))
          ) : (
            <p className="text-fontcolor-muted">No analysis for this Bill yet.</p>
          )}
        </div>

        <Button asChild variant="secondary">
          <ExternalLink href={`https://www.dotheysupportit.com/bills/${bill.id}/create-analysis`}>
            Add Analysis
          </ExternalLink>
        </Button>
      </section>

      <VotesSection countryCode={countryCode} votes={relationships} />
    </div>
  )
}
