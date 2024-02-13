'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'
import { motion } from 'framer-motion'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { cn } from '@/utils/web/cn'

import { ORDERED_USER_ACTION_ROW_CTA_INFO } from './constants'

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
        ? ORDERED_USER_ACTION_ROW_CTA_INFO
        : ORDERED_USER_ACTION_ROW_CTA_INFO.filter(
            action => !excludeUserActionTypes.includes(action.actionType),
          ),
    [excludeUserActionTypes],
  )
  return (
    <div className={className}>
      {filteredActions.map(({ actionType, ...rest }, index) => (
        <motion.div
          // we apply individual pb to the elements instead of space-y-7 to ensure that there's no jank in the animation as the height transitions in
          className={cn(index !== 0 && 'pt-4')}
          initial={{ opacity: 0, transform: index % 2 ? 'translateX(-60px)' : 'translateX(60px)' }}
          key={actionType}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-150px' }}
          whileInView={{ opacity: 1, transform: 'translateX(0)' }}
        >
          <UserActionRowCTA
            state={
              !performedUserActionTypes
                ? 'unknown'
                : performedUserActionTypes.includes(actionType)
                  ? 'complete'
                  : 'incomplete'
            }
            {...{ actionType, ...rest }}
          />
        </motion.div>
      ))}
    </div>
  )
}
