'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'
import { motion } from 'framer-motion'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { cn } from '@/utils/web/cn'
import { USER_ACTION_TYPE_PRIORITY_ORDER } from '@/utils/web/userActionUtils'

export function UserActionRowCTAsAnimatedList({
  performedUserActionTypes,
  excludeUserActionTypes,
  className,
}: {
  className?: string
  performedUserActionTypes?: UserActionType[]
  excludeUserActionTypes?: UserActionType[]
}) {
  const isDesktop = useIsDesktop({ defaultState: false })
  const filteredActions = useMemo(
    () =>
      !excludeUserActionTypes
        ? USER_ACTION_TYPE_PRIORITY_ORDER
        : USER_ACTION_TYPE_PRIORITY_ORDER.filter(
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
              /*
            On iOS mobile, if we do the sideways animation the entire viewport will have an overscroll (because the content if past the screen until it animates in)
            To prevent this, we want a simpler, vertical animation on screen sizes smaller than desktop
            */
              transform: isDesktop
                ? index % 2
                  ? `translateX(-60px)`
                  : `translateX(60px)`
                : `translateY(60px)`,
            }}
            key={`${actionType}-${isDesktop.toString()}`}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-150px' }}
            whileInView={{ opacity: 1, transform: isDesktop ? `translateX(0)` : `translateY(0)` }}
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
