import React from 'react'

import { DTSIBillCard } from '@/components/app/dtsiBillCard'
import { DTSIStanceDetailsQuote } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsQuote'
import { DTSIStanceDetailsTweet } from '@/components/app/dtsiStanceDetails/dtsiStanceDetailsTweet'
import {
  DTSIStanceDetailsStanceProp,
  IStanceDetailsProps,
} from '@/components/app/dtsiStanceDetails/types'
import { DTSI_PersonStanceType } from '@/data/dtsi/generated'
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

export function DTSIStanceDetails({ className, ...props }: IStanceDetailsProps) {
  return (
    <article className={cn('rounded-3xl bg-secondary p-4 md:p-6', className)}>
      <StanceTypeContent {...props} />
    </article>
  )
}
