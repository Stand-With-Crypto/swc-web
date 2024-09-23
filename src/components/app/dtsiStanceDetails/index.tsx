import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { AnalysisDetails } from '@/components/app/dtsiAnalysisDetails'
import { DTSIBillCard } from '@/components/app/dtsiBillCard'
import { DTSIStanceDetailsQuote } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsQuote'
import { DTSIStanceDetailsTweet } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsTweet'
import {
  DTSIStanceDetailsStanceProp,
  IStanceDetailsProps,
} from '@/components/app/dtsiStanceDetails/types'
import { DTSIUserAvatar } from '@/components/app/dtsiUserAvatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ExternalLink } from '@/components/ui/link'
import { DTSI_PersonStanceType } from '@/data/dtsi/generated'
import { dtsiPersonBillRelationshipTypeAsVerb } from '@/utils/dtsi/dtsiPersonBillRelationshipUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { cn } from '@/utils/web/cn'
import { listOfThings } from '@/utils/web/listOfThings'

function StanceTypeContent({ stance: passedStance, ...props }: IStanceDetailsProps) {
  const stance = passedStance as DTSIStanceDetailsStanceProp
  if (stance.stanceType === DTSI_PersonStanceType.TWEET) {
    return <DTSIStanceDetailsTweet {...props} stance={stance} />
  }
  if (stance.stanceType === DTSI_PersonStanceType.QUOTE) {
    return <DTSIStanceDetailsQuote {...props} stance={stance} />
  }
  if (stance.stanceType === DTSI_PersonStanceType.BILL_RELATIONSHIP) {
    return (
      <DTSIBillCard
        bill={stance.billRelationship?.bill}
        className="p-0 sm:p-0"
        description={`This bill is ${convertDTSIStanceScoreToCryptoSupportLanguage(stance.billRelationship.bill.computedStanceScore).toLowerCase()}.`}
        {...props}
      >
        <CryptoSupportHighlight
          className="flex-shrink-0 rounded-full py-2"
          stanceScore={stance.computedStanceScore}
          text={dtsiPersonBillRelationshipTypeAsVerb(stance?.billRelationship?.relationshipType)}
        />
      </DTSIBillCard>
    )
  }
  throw new Error(`invalid StanceDetails passed ${JSON.stringify(stance)}`)
}

export function DTSIStanceDetails({ className, ...props }: IStanceDetailsProps) {
  const stance = props.stance
  const stanceScore = stance.computedStanceScore
  const hasVisibleAnalysis =
    Boolean(stance.analysis.length) || Boolean(stance.additionalAnalysis.length)
  const additionalAnalysisUsers = stance.additionalAnalysis.map(x => x.publicUser)
  return (
    <article className={cn('rounded-3xl bg-secondary p-4 sm:p-6', className)}>
      <StanceTypeContent {...props} />
      {stance.stanceType !== DTSI_PersonStanceType.BILL_RELATIONSHIP && (
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
          <CryptoSupportHighlight className="mt-4 rounded-full py-2" stanceScore={stanceScore} />
          <Dialog analytics={'View DTSI Analysis'}>
            <DialogTrigger asChild>
              <Button className="bg-transparent text-primary hover:bg-gray-300 max-sm:hover:underline sm:bg-primary sm:text-primary-foreground sm:hover:bg-primary/80">
                View Analysis
              </Button>
            </DialogTrigger>
            <DialogContent a11yTitle="View DTSI Analysis" className="max-w-2xl">
              <DialogBody className="flex flex-col justify-between space-y-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold">Top analysis on stance</h3>
                    <h4 className="mt-2 text-lg">
                      Crypto advocates like you can submit your own analysis of this stance on our
                      data partner{' '}
                      <ExternalLink
                        href={`https://www.dotheysupportit.com/stances/${stance.id}/create-analysis`}
                      >
                        DoTheySupportIt.com
                      </ExternalLink>
                      .
                      {!!stance.analysis.length &&
                        " Below you'll see some of the top contributions from the crypto community:"}
                    </h4>
                  </div>
                  {hasVisibleAnalysis && (
                    <>
                      <div className="flex flex-col space-y-5">
                        {stance.analysis.map(analysis => {
                          return (
                            <div key={analysis.id}>
                              <AnalysisDetails analysis={analysis} analysisType="stance" />
                            </div>
                          )
                        })}
                      </div>
                      {Boolean(additionalAnalysisUsers.length) && (
                        <div>
                          <div className="flex">
                            {additionalAnalysisUsers.slice(0, 25).map((user, index) => (
                              <DTSIUserAvatar
                                key={user.id}
                                size={24}
                                style={{ transform: `translateX(-${index * 5}px)` }}
                                user={user}
                              />
                            ))}
                          </div>
                          <div className="text-sm">
                            {additionalAnalysisUsers.length ? 'Other analysis' : 'analysis'}{' '}
                            submitted by{' '}
                            {listOfThings(
                              additionalAnalysisUsers.length > 5
                                ? [
                                    ...additionalAnalysisUsers
                                      .slice(0, 3)
                                      .map(user => user.displayName),
                                    `${additionalAnalysisUsers.length - 3} other users`,
                                  ]
                                : additionalAnalysisUsers.slice(0, 3).map(user => user.displayName),
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="pb-4">
                  <Button asChild className="block whitespace-normal text-center">
                    <ExternalLink
                      href={`https://www.dotheysupportit.com/stances/${stance.id}/create-analysis`}
                    >
                      Submit New Analysis on DoTheySupportIt.com
                    </ExternalLink>
                  </Button>
                </div>
              </DialogBody>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </article>
  )
}
