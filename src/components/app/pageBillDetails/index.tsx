import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { Button } from '@/components/ui/button'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_Person } from '@/data/dtsi/generated'
import { DTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface PageBillDetailsProps {
  bill: DTSIBillDetails
  locale: SupportedLocale
}

const AvatarGrid = ({ people, locale }: { people: DTSI_Person[]; locale: SupportedLocale }) => (
  <div className="mx-auto grid w-fit grid-flow-col grid-cols-[repeat(auto-fill,minmax(126px,1fr))] justify-items-center gap-4">
    {people.map(person => (
      <LinkBox className="flex w-fit flex-col items-center gap-2" key={person.id}>
        <DTSIAvatar className="rounded-full" person={person} size={126} />
        <InternalLink
          className={cn(linkBoxLinkClassName, 'cursor-pointer font-semibold')}
          data-link-box-subject
          href={getIntlUrls(locale).politicianDetails('#slug')}
        >
          {dtsiPersonFullName(person)}
        </InternalLink>
      </LinkBox>
    ))}
  </div>
)

export function PageBillDetails(props: PageBillDetailsProps) {
  const { bill, locale } = props

  console.log('bill', bill)

  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="space-y-8 text-center">
        <PageTitle>{bill.title}</PageTitle>
        <p className="font-semibold">
          <FormattedDatetime
            date={new Date(bill.datetimeCreated)}
            dateStyle="medium"
            locale={locale}
          />
        </p>
        <PageSubTitle>{bill.summary}</PageSubTitle>
        <ExternalLink className="inline-block" href="#">
          {bill.congressDotGovUrl}
        </ExternalLink>
        <CryptoSupportHighlight
          className="mx-auto"
          stanceScore={bill.computedStanceScore}
          text={convertDTSIStanceScoreToCryptoSupportLanguage(bill.computedStanceScore)}
        />
      </section>

      <section className="space-y-8 text-center">
        <p className="font-semibold">Analysis</p>

        <div className="space-y-6 text-center text-fontcolor-muted">
          {bill.analysis.map(analysis => (
            <p key={analysis.id}>{analysis.internalNotes}</p>
          ))}
        </div>

        <Button variant="secondary">Add Analysis</Button>
      </section>

      <section className="space-y-16 text-center">
        <div className="space-y-8">
          <p className="font-semibold">Sponsors</p>
          <AvatarGrid
            locale={locale}
            people={[
              {
                id: '1',
                firstName: 'FName',
                lastName: 'LName',
              } as DTSI_Person,
            ]}
          />
        </div>

        <div className="space-y-8">
          <p className="font-semibold">Co-Sponsors</p>
        </div>

        <div className="space-y-8">
          <p className="font-semibold">Voted for</p>
        </div>

        <p className="font-semibold">Voted against</p>
      </section>
    </div>
  )
}
