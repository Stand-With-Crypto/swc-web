import { orderBy } from 'lodash-es'
import { FileTextIcon } from 'lucide-react'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { VotesSection } from '@/components/app/pageBillDetails/votesSection'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { StyledHtmlContent } from '@/components/ui/styledHtmlContent'
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

      {bill.analysis && (
        <section className="space-y-6 text-center lg:space-y-10">
          <p className="text-4xl font-bold">Analysis</p>
          <div className="flex flex-col gap-10 lg:flex-row">
            <StyledHtmlContent
              className="w-full space-y-4 text-start text-fontcolor-muted [&_strong]:text-fontcolor-muted"
              html={bill.analysis}
            />
            {bill.relatedUrls.length > 0 && (
              <div className="flex h-max w-full flex-col gap-6 rounded-3xl border border-muted p-6 lg:w-[478px]">
                <strong className="text-lg">More Resources</strong>
                {bill.relatedUrls.map(relatedUrl => (
                  <ExternalLink
                    className="flex w-full items-center gap-4 text-start text-primary"
                    href={relatedUrl.url}
                    key={relatedUrl.url}
                  >
                    <FileTextIcon size={24} />
                    <span className="flex-1">{relatedUrl.title}</span>
                  </ExternalLink>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <VotesSection countryCode={countryCode} votes={relationships} />
    </div>
  )
}
