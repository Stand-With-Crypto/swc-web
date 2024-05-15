import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { AvatarGrid } from '@/components/app/pageBillDetails/avatarGrid'
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

  const sponsors = relationshipsByType.get(DTSI_BillPersonRelationshipType.SPONSOR)
  const coSponsors = relationshipsByType.get(DTSI_BillPersonRelationshipType.COSPONSOR)
  const votedFor = relationshipsByType.get(DTSI_BillPersonRelationshipType.VOTED_FOR)
  const votedAgainst = relationshipsByType.get(DTSI_BillPersonRelationshipType.VOTED_AGAINST)

  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="space-y-8 text-center">
        <PageTitle>{bill.shortTitle || bill.title}</PageTitle>
        <p className="font-semibold">
          <FormattedDatetime
            date={new Date(bill.datetimeCreated)}
            dateStyle="medium"
            locale={locale}
          />
        </p>
        <PageSubTitle>{bill.summary || bill.title}</PageSubTitle>
        <ExternalLink className="inline-block" href={bill.congressDotGovUrl}>
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

        <Button asChild variant="secondary">
          <ExternalLink href={`https://www.dotheysupportit.com/bills/${bill.id}/create-analysis`}>
            Add Analysis
          </ExternalLink>
        </Button>
      </section>

      <section className="space-y-16 text-center">
        <div className="space-y-8">
          <p className="font-semibold">Sponsors</p>
          <AvatarGrid avatarSize={AVATAR_SIZE} nItems={14}>
            {sponsors?.length ? (
              sponsors?.map((person, i) => (
                <DTSIAvatarBox key={i} locale={locale} person={person} size={AVATAR_SIZE} />
              ))
            ) : (
              <p className="text-fontcolor-muted">No sponsors</p>
            )}
          </AvatarGrid>
        </div>

        <div className="space-y-8">
          <p className="font-semibold">Co-Sponsors</p>
          <AvatarGrid avatarSize={AVATAR_SIZE} nItems={14}>
            {coSponsors?.length ? (
              coSponsors?.map((person, i) => (
                <DTSIAvatarBox key={i} locale={locale} person={person} size={AVATAR_SIZE} />
              ))
            ) : (
              <p className="text-fontcolor-muted">No co-sponsors</p>
            )}
          </AvatarGrid>
        </div>

        <div className="space-y-8">
          <p className="font-semibold">Voted for</p>
          <AvatarGrid avatarSize={AVATAR_SIZE} nItems={14}>
            {votedFor?.length ? (
              votedFor?.map((person, i) => (
                <DTSIAvatarBox key={i} locale={locale} person={person} size={AVATAR_SIZE} />
              ))
            ) : (
              <p className="text-fontcolor-muted">No votes for</p>
            )}
          </AvatarGrid>
        </div>

        <div className="space-y-8">
          <p className="font-semibold">Voted against</p>
          <AvatarGrid avatarSize={AVATAR_SIZE} nItems={14}>
            {votedAgainst?.length ? (
              votedAgainst?.map((person, i) => (
                <DTSIAvatarBox key={i} locale={locale} person={person} size={AVATAR_SIZE} />
              ))
            ) : (
              <p className="text-fontcolor-muted">No votes against</p>
            )}
          </AvatarGrid>
        </div>
      </section>
    </div>
  )
}
