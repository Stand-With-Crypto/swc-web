import { ReactNode } from 'react'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIAvatarBox } from '@/components/app/pageBillDetails/dtsiAvatarBox'
import { Button } from '@/components/ui/button'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_BillPersonRelationshipType } from '@/data/dtsi/generated'
import { DTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import { SupportedLocale } from '@/intl/locales'
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'

interface PageBillDetailsProps {
  bill: DTSIBillDetails
  locale: SupportedLocale
}

const AVATAR_SIZE = 126

const AvatarGrid = ({ children }: { children: ReactNode }) => (
  <div
    className={`mx-auto grid w-fit grid-flow-col grid-cols-[repeat(auto-fill,minmax(${AVATAR_SIZE}px,1fr))] justify-items-center gap-4`}
  >
    {children}
  </div>
)

export function PageBillDetails(props: PageBillDetailsProps) {
  const { bill, locale } = props

  const relationshipsByType = bill.relationships.reduce((acc, relationship) => {
    const type = relationship.relationshipType

    if (!acc.has(type)) {
      acc.set(type, [])
    }

    acc.get(type)?.push(relationship.person)

    return acc
  }, new Map<DTSI_BillPersonRelationshipType, DTSIBillDetails['relationships'][0]['person'][]>())

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
          <AvatarGrid>
            {relationshipsByType
              .get(DTSI_BillPersonRelationshipType.SPONSOR)
              ?.map((person, i) => (
                <DTSIAvatarBox key={i} locale={locale} person={person} size={AVATAR_SIZE} />
              ))}
          </AvatarGrid>
        </div>

        <div className="space-y-8">
          <p className="font-semibold">Co-Sponsors</p>
          <AvatarGrid>
            {relationshipsByType
              .get(DTSI_BillPersonRelationshipType.COSPONSOR)
              ?.map((person, i) => (
                <DTSIAvatarBox key={i} locale={locale} person={person} size={AVATAR_SIZE} />
              ))}
          </AvatarGrid>
        </div>

        <div className="space-y-8">
          <p className="font-semibold">Voted for</p>
          <AvatarGrid>
            {relationshipsByType
              .get(DTSI_BillPersonRelationshipType.VOTED_FOR)
              ?.map((person, i) => (
                <DTSIAvatarBox key={i} locale={locale} person={person} size={AVATAR_SIZE} />
              ))}
          </AvatarGrid>
        </div>

        <div className="space-y-8">
          <p className="font-semibold">Voted against</p>
          <AvatarGrid>
            {relationshipsByType
              .get(DTSI_BillPersonRelationshipType.VOTED_AGAINST)
              ?.map((person, i) => (
                <DTSIAvatarBox key={i} locale={locale} person={person} size={AVATAR_SIZE} />
              ))}
          </AvatarGrid>
        </div>
      </section>
    </div>
  )
}
