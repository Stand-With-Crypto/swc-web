'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'
import { motion } from 'motion/react'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { getUserActionCTAInfo } from '@/components/app/userActionRowCTA/constants'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { cn } from '@/utils/web/cn'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'

export function UserActionRowCTAsAnimatedList({
  performedUserActionTypesResponse,
  excludeUserActionTypes,
  className,
}: {
  className?: string
  performedUserActionTypesResponse?: ReturnType<
    typeof useApiResponseForUserPerformedUserActionTypes
  >['data']
  excludeUserActionTypes?: UserActionType[]
}) {
  const filteredActions = useMemo(() => {
    return !excludeUserActionTypes
      ? USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN
      : USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.filter(
          ({ action }) => !excludeUserActionTypes.includes(action),
        )
  }, [excludeUserActionTypes])

  const parsedPerformedUserActionTypes = performedUserActionTypesResponse?.performedUserActionTypes

  return (
    <div className={className}>
      {filteredActions.map((item, index) => {
        const props = getUserActionCTAInfo(item.action, item.campaign)
        return (
          <motion.div
            // we apply individual pb to the elements instead of space-y-7 to ensure that there's no jank in the animation as the height transitions in
            className={cn(index !== 0 && 'pt-4')}
            initial={{
              opacity: 0,
              transform: `translateY(60px)`,
            }}
            key={`${item.action}-${item.campaign}`}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-150px' }}
            whileInView={{ opacity: 1, transform: 'translateY(0)' }}
          >
            <UserActionRowCTA
              state={
                !parsedPerformedUserActionTypes
                  ? 'unknown'
                  : parsedPerformedUserActionTypes.some(
                        performedAction =>
                          performedAction.actionType === item.action &&
                          performedAction.campaignName === item.campaign,
                      )
                    ? 'complete'
                    : 'incomplete'
              }
              {...props}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
