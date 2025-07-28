import React from 'react'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBillCard } from '@/components/app/dtsiBillCard'
import { DTSIStanceDetailsQuote } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsQuote'
import { DTSIStanceDetailsTweet } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsTweet'
import {
  DTSIStanceDetailsStanceProp,
  StanceDetailsProps,
} from '@/components/app/dtsiStanceDetails/types'
import { InfoCard } from '@/components/ui/infoCard'
import { DTSI_PersonStanceType } from '@/data/dtsi/generated'
import { dtsiPersonBillRelationshipTypeAsVerb } from '@/utils/dtsi/dtsiPersonBillRelationshipUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'

function StanceTypeContent({ stance: passedStance, isStanceHidden, ...props }: StanceDetailsProps) {
  const stance = passedStance as DTSIStanceDetailsStanceProp

  if (stance.stanceType === DTSI_PersonStanceType.TWEET) {
    return <DTSIStanceDetailsTweet isStanceHidden={isStanceHidden} {...props} stance={stance} />
  }
  if (stance.stanceType === DTSI_PersonStanceType.QUOTE) {
    return <DTSIStanceDetailsQuote isStanceHidden={isStanceHidden} {...props} stance={stance} />
  }
  if (stance.stanceType === DTSI_PersonStanceType.BILL_RELATIONSHIP) {
    const bill = stance.billRelationship?.bill

    return (
      <DTSIBillCard
        bill={{
          ...bill,
          billNumberOrDTSISlug: bill.slug,
        }}
        className="p-0 sm:p-0"
        description={`This bill is ${convertDTSIStanceScoreToCryptoSupportLanguage(stance.billRelationship.bill.computedStanceScore).toLowerCase()}.`}
        {...props}
      >
        <CryptoSupportHighlight
          className="flex-shrink-0 rounded-full"
          stanceScore={!isStanceHidden ? stance.computedStanceScore : null}
          text={dtsiPersonBillRelationshipTypeAsVerb(stance?.billRelationship?.relationshipType)}
        />
      </DTSIBillCard>
    )
  }
  throw new Error(`invalid StanceDetails passed ${JSON.stringify(stance)}`)
}

export function DTSIStanceDetails({ className, isStanceHidden, ...props }: StanceDetailsProps) {
  const stance = props.stance
  const stanceScore = stance.computedStanceScore

  return (
    <InfoCard as="article" className={className}>
      <StanceTypeContent isStanceHidden={isStanceHidden} {...props} />
      {!isStanceHidden && stance.stanceType !== DTSI_PersonStanceType.BILL_RELATIONSHIP && (
        <CryptoSupportHighlight className="mt-7 rounded-full py-2" stanceScore={stanceScore} />
      )}
    </InfoCard>
  )
}
