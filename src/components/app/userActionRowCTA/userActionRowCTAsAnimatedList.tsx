'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'
import { motion } from 'framer-motion'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { cn } from '@/utils/web/cn'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER } from '@/utils/web/userActionUtils'

export function UserActionRowCTAsAnimatedList({
  performedUserActionTypes,
  excludeUserActionTypes,
  className,
}: {
  className?: string
  performedUserActionTypes?: UserActionType[]
  excludeUserActionTypes?: UserActionType[]
}) {
  const filteredActions = useMemo(
    () =>
      !excludeUserActionTypes
        ? USER_ACTION_TYPE_CTA_PRIORITY_ORDER
        : USER_ACTION_TYPE_CTA_PRIORITY_ORDER.filter(
            actionType => !excludeUserActionTypes.includes(actionType),
          ),
    [excludeUserActionTypes],
  )
  return (
    <div className={className}>
      {filteredActions.map((actionType, index) => {
        const props = USER_ACTION_ROW_CTA_INFO[actionType]
        return (
          <motion.div
            // we apply individual pb to the elements instead of space-y-7 to ensure that there's no jank in the animation as the height transitions in
            className={cn(index !== 0 && 'pt-4')}
            initial={{
              opacity: 0,
              transform: `translateY(60px)`,
            }}
            key={actionType}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-150px' }}
            whileInView={{ opacity: 1, transform: 'translateY(0)' }}
          >
            <UserActionRowCTA
              state={
                !performedUserActionTypes
                  ? 'unknown'
                  : performedUserActionTypes.includes(actionType)
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
