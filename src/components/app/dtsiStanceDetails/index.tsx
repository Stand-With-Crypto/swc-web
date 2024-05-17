import React from 'react'
import { isNil } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBillCard } from '@/components/app/dtsiBillCard'
import { DTSIStanceDetailsQuote } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsQuote'
import { DTSIStanceDetailsTweet } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsTweet'
import {
  DTSIStanceDetailsStancePassedProp,
  DTSIStanceDetailsStanceProp,
  IStanceDetailsProps,
} from '@/components/app/dtsiStanceDetails/types'
import { DTSI_BillPersonRelationshipType, DTSI_PersonStanceType } from '@/data/dtsi/generated'
import { dtsiPersonBillRelationshipTypeAsVerb } from '@/utils/dtsi/dtsiPersonBillRelationshipUtils'
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
    return <DTSIBillCard bill={stance.billRelationship?.bill} className="p-0 md:p-0" {...props} />
  }
  throw new Error(`invalid StanceDetails passed ${JSON.stringify(stance)}`)
}

/**
 * If the stance type is a {@link DTSI_PersonStanceType.BILL_RELATIONSHIP}, we want to compare the {@link DTSI_BillPersonRelationshipType}
 * to the stance score of the bill to determine the stance score of the politician. The logic is as follows:
 *  - Bill is pro-crypto and relationship type is VOTED_FOR/SPONSOR/COSPONSOR: thumbs up;
 *  - Bill is pro-crypto and relationship type is VOTED_AGAINST: thumbs down;
 *  - Bill is anti-crypto and relationship type is VOTED_FOR/SPONSOR/COSPONSOR: thumbs down;
 *  - Bill is anti-crypto and relationship type is VOTED_AGAINST: thumbs up;
 *
 */
const getStanceScore = (stance: DTSIStanceDetailsStancePassedProp) => {
  if (stance.stanceType === DTSI_PersonStanceType.BILL_RELATIONSHIP) {
    if (isNil(stance.billRelationship?.bill?.computedStanceScore)) return

    const isProCrypto = stance?.billRelationship?.bill?.computedStanceScore > 50
    const isFor = [
      DTSI_BillPersonRelationshipType.VOTED_FOR,
      DTSI_BillPersonRelationshipType.SPONSOR,
      DTSI_BillPersonRelationshipType.COSPONSOR,
    ].includes(stance.billRelationship?.relationshipType)
    const isAgainst =
      stance.billRelationship?.relationshipType === DTSI_BillPersonRelationshipType.VOTED_AGAINST

    return isProCrypto ? (isFor ? 100 : 0) : isAgainst ? 100 : 0
  }

  return stance.computedStanceScore
}

export function DTSIStanceDetails({ className, ...props }: IStanceDetailsProps) {
  const stance = props.stance
  const stanceScore = getStanceScore(stance)

  return (
    <article className={cn('rounded-3xl bg-secondary p-4 md:p-6', className)}>
      <StanceTypeContent {...props} />
      <CryptoSupportHighlight
        className="mt-4 rounded-full py-2 sm:mt-6"
        stanceScore={stanceScore}
        text={
          /**
           * If its a Bill stance, show the politician's stance on the bill
           * instead of whether or not the bill is pro-crypto. For example,
           * we'd show "thumbs up, voted against" for anti-crypto bills.
           */
          stance?.billRelationship?.relationshipType &&
          dtsiPersonBillRelationshipTypeAsVerb(stance?.billRelationship?.relationshipType)
        }
      />
    </article>
  )
}
