import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { PageTitle } from '@/components/ui/pageTitleText'
import { StyledHtmlContent } from '@/components/ui/styledHtmlContent'
import { BillDetails } from '@/data/bills/types'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface HeaderProps {
  bill: BillDetails
  countryCode: SupportedCountryCodes
}

export function Header({ bill, countryCode }: HeaderProps) {
  return (
    <header className="container space-y-8 text-center font-sans">
      <div>
        <PageTitle>{bill.title}</PageTitle>
        <p className="mb-8 mt-5 font-bold text-fontcolor-muted">
          <FormattedDatetime
            date={new Date(bill.dateIntroduced)}
            dateStyle="medium"
            locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
          />
        </p>
        <CryptoSupportHighlight className="mx-auto" stanceScore={bill.computedStanceScore} />

        <StyledHtmlContent
          className="my-10 font-medium [&_*]:text-fontcolor-muted [&_h2]:text-lg [&_h2]:font-medium"
          html={bill.summary}
        />
      </div>
    </header>
  )
}
