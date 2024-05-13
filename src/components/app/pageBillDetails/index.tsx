import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { Button } from '@/components/ui/button'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_Person } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface PageBillDetailsProps {
  bill: Bill
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
  const { locale } = props

  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="space-y-8 text-center">
        <PageTitle>[PH] Bill Title</PageTitle>
        <p className="font-semibold">
          <FormattedDatetime date={new Date()} dateStyle="medium" locale={locale} />
        </p>
        <PageSubTitle>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc
          condimentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
          cubilia Curae; Donec ultricies, metus nec vehicula ultricies, urna nunc fermentum metus,
          nec tristique justo ligula in nunc. Donec eget nunc vel eros tincidunt vehicula.
        </PageSubTitle>
        <ExternalLink className="inline-block" href="#">
          https://www.congress.gov/bill/118th-congress/senate-bill/2669
        </ExternalLink>
        <CryptoSupportHighlight className="mx-auto" stanceScore={100} text="Pro-crypto" />
      </section>

      <section className="space-y-8 text-center">
        <p className="font-semibold">Analysis</p>

        <p className="text-center text-fontcolor-muted">
          "Aliqua irure est in proident cillum ut aute labore proident velit eiusmod mollit
          proident. Occaecat nisi occaecat culpa irure sint adipisicing ullamco anim in ea elit. Id
          enim et dolore laborum consequat. Lorem ad cillum proident ullamco occaecat dolore nulla
          occaecat velit. Sunt ullamco duis magna ullamco.
          <br />
          <br /> Fugiat occaecat magna elit elit sit eiusmod laborum proident cillum minim proident
          consectetur commodo. Do excepteur dolor labore ex consequat duis. Et Lorem nulla excepteur
          dolor exercitation culpa minim nisi nulla enim deserunt proident. Nisi culpa enim occaecat
          tempor cupidatat id ad adipisicing ea qui nostrud nisi. Amet sunt ex sunt anim est sit
          deserunt consequat nostrud Lorem amet velit pariatur pariatur. Do qui enim aliqua sit
          occaecat veniam anim. Eiusmod elit labore ullamco voluptate amet magna exercitation
          exercitation occaecat laborum veniam. Duis culpa ullamco pariatur in duis elit in ex quis.
          <br />
          <br /> Non laborum ipsum fugiat occaecat deserunt laboris mollit et tempor ex sit.
          Proident aliquip nostrud sit veniam deserunt reprehenderit ut aute duis pariatur commodo
          Lorem. Ut sint non cillum quis consectetur esse enim irure exercitation occaecat dolor et
          commodo. Ad tempor ea ea exercitation adipisicing elit nulla enim eu. Aliqua amet non
          culpa id voluptate non. Culpa sint pariatur occaecat tempor labore incididunt excepteur ad
          fugiat. Irure eiusmod exercitation proident dolor consectetur. Commodo nulla aute officia
          nostrud sunt nostrud. Deserunt velit pariatur velit esse cillum magna laboris. Nulla anim
          dolor deserunt commodo incididunt consequat."
        </p>

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
