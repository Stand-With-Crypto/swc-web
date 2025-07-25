import { format, parseISO } from 'date-fns'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBillCard } from '@/components/app/dtsiBillCard'
import { BillStance, PoliticianDetails } from '@/components/app/pagePoliticianDetails/common/types'
import { InfoCard } from '@/components/ui/infoCard'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_BillPersonRelationshipType } from '@/data/dtsi/generated'
import { dtsiPersonBillRelationshipTypeAsVerb } from '@/utils/dtsi/dtsiPersonBillRelationshipUtils'
import { shouldPersonHaveStanceScoresHidden } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

const MAPPED_VOTE_TYPES = {
  EXECUTIVE_OR_EXTERNAL_ACTION: 'Executive Branch Actioned',
  FINAL_PASSAGE: 'Final passage out of {category}',
  LEGISLATIVE_ACTION: 'Legislative Vote in {category}',
  PROCEDURAL_ACTION: 'Procedural Vote in {category}',
}

const handleStanceTitleAndDescription = ({ stance }: { stance: BillStance }) => {
  const billVotePersonPosition = stance?.billRelationship?.billVotePersonPosition
  const billVote = billVotePersonPosition?.billVote

  let stanceTitle = ''

  if (billVotePersonPosition) {
    const voteTitle =
      billVote?.displayName ||
      MAPPED_VOTE_TYPES[billVote?.voteType as keyof typeof MAPPED_VOTE_TYPES]
    const billCategory = billVotePersonPosition.billVote.category.toLowerCase()
    const category = `${billCategory[0].toUpperCase()}${billCategory.slice(1)}`

    stanceTitle = voteTitle.replace('{category}', category)
  } else {
    stanceTitle = 'Introduced in House'
  }

  const dateStanceMade = format(parseISO(stance.dateStanceMade), 'MMMM d, yyyy')
  const significanceDescription = billVote?.significanceDescription

  const stanceDescription = `${dateStanceMade}${significanceDescription ? ` - ${significanceDescription}` : ''}`

  return { stanceTitle, stanceDescription }
}

function VoteSection({
  person,
  countryCode,
}: {
  person: PoliticianDetails
  countryCode: SupportedCountryCodes
}) {
  const { bills } = person.stances

  const votesExtraClassNames =
    '[&>.info-card:first-child]:border-none [&>.info-card]:rounded-none [&>.info-card]:border-t-2 [&>.info-card]:border-t-white'

  return (
    <div>
      <PageTitle as="h2" className="text-center" size="md">
        Vote History
      </PageTitle>

      {bills.length ? (
        bills.map(billData => {
          const { stances, bill } = billData

          const stanceScoreToCryptoSupportLanguage = convertDTSIStanceScoreToCryptoSupportLanguage(
            bill?.computedStanceScore,
          ).toLowerCase()

          const billTitle = bill?.shortTitle || bill.title
          const billDescription = `This bill is ${stanceScoreToCryptoSupportLanguage}.`

          return (
            <div
              className={cn(
                'mb-16 mt-8 box-border space-y-0 overflow-hidden rounded-3xl',
                votesExtraClassNames,
              )}
              key={bill.id}
            >
              <InfoCard as="article">
                <DTSIBillCard
                  bill={bill}
                  className="p-0 sm:p-0"
                  countryCode={countryCode}
                  description={billDescription}
                  title={billTitle}
                />
              </InfoCard>

              {stances.map(stance => {
                const { stanceTitle, stanceDescription } = handleStanceTitleAndDescription({
                  stance,
                })

                const cryptoSupportText = dtsiPersonBillRelationshipTypeAsVerb(
                  stance?.billRelationship?.relationshipType as DTSI_BillPersonRelationshipType,
                )

                return (
                  <InfoCard as="article" key={stance.id}>
                    <DTSIBillCard
                      bill={bill}
                      className="p-0 sm:p-0"
                      countryCode={countryCode}
                      description={stanceDescription}
                      title={stanceTitle}
                    >
                      <CryptoSupportHighlight
                        className="flex-shrink-0 rounded-full"
                        stanceScore={
                          shouldPersonHaveStanceScoresHidden(person)
                            ? null
                            : stance.computedStanceScore
                        }
                        text={cryptoSupportText}
                      />
                    </DTSIBillCard>
                  </InfoCard>
                )
              })}
            </div>
          )
        })
      ) : (
        <div className="mb-11 flex items-center justify-center">No recent votes.</div>
      )}
    </div>
  )
}

export default VoteSection
