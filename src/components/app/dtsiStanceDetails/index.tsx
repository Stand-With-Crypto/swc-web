import React from 'react'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBillCard } from '@/components/app/dtsiBillCard'
import { DTSIStanceDetailsQuote } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsQuote'
import { DTSIStanceDetailsTweet } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsTweet'
import {
  DTSIStanceDetailsStanceProp,
  IStanceDetailsProps,
} from '@/components/app/dtsiStanceDetails/types'
import { DTSI_PersonStanceType } from '@/data/dtsi/generated'
import { dtsiPersonBillRelationshipTypeAsVerb } from '@/utils/dtsi/dtsiPersonBillRelationshipUtils'
import { isPoliticianStanceHidden } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { cn } from '@/utils/web/cn'

function StanceTypeContent({ stance: passedStance, ...props }: IStanceDetailsProps) {
  const stance = passedStance as DTSIStanceDetailsStanceProp
  if (stance.stanceType === DTSI_PersonStanceType.TWEET) {
    return <DTSIStanceDetailsTweet {...props} stance={stance} />
  }
  if (stance.stanceType === DTSI_PersonStanceType.QUOTE) {
    return <DTSIStanceDetailsQuote {...props} stance={stance} />
  }
  if (stance.stanceType === DTSI_PersonStanceType.BILL_RELATIONSHIP) {
    const isStanceHidden = isPoliticianStanceHidden(props.person.slug)
    return (
      <DTSIBillCard
        bill={stance.billRelationship?.bill}
        className="p-0 sm:p-0"
        description={`This bill is ${convertDTSIStanceScoreToCryptoSupportLanguage(stance.billRelationship.bill.computedStanceScore).toLowerCase()}.`}
        {...props}
      >
        <CryptoSupportHighlight
          className="flex-shrink-0 rounded-full py-2"
          stanceScore={!isStanceHidden ? stance.computedStanceScore : null}
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

  return (
    <article className={cn('rounded-3xl bg-secondary p-4 md:p-6', className)}>
      <StanceTypeContent {...props} />
      {!isPoliticianStanceHidden(props.person.slug) &&
        stance.stanceType !== DTSI_PersonStanceType.BILL_RELATIONSHIP && (
          <CryptoSupportHighlight className="mt-4 rounded-full py-2" stanceScore={stanceScore} />
        )}
    </article>
  )
}
