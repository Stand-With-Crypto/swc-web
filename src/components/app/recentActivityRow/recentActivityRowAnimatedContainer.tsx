'use client'
import { AnimatePresence, motion } from 'motion/react'

import { RecentActivityRowProps } from '@/components/app/recentActivityRow/recentActivityRow'
import { VariantRecentActivityRow } from '@/components/app/recentActivityRow/variantRecentActivityRow'
import { useCountryCode } from '@/hooks/useCountryCode'
import { isValidStateCodeByCountryCode } from '@/utils/shared/stateUtils'
import { cn } from '@/utils/web/cn'

export function RecentActivityRowAnimatedContainer({
  actions,
}: {
  actions: RecentActivityRowProps['action'][]
}) {
  const countryCode = useCountryCode()
  return (
    <AnimatePresence initial={false}>
      <div>
        {actions
          .filter(action => {
            if (action.user.userLocationDetails?.administrativeAreaLevel1) {
              const isValidStateCode = isValidStateCodeByCountryCode(
                countryCode,
                action.user.userLocationDetails.administrativeAreaLevel1,
              )

              return isValidStateCode
            }

            return true
          })
          .map((action, index) => (
            <motion.div
              // we apply individual pb to the elements instead of space-y-7 to ensure that there's no jank in the animation as the height transitions in
              animate={{ opacity: 1, transform: 'translateY(0)' }}
              className={cn(index !== 0 && 'pt-8 lg:pt-10')}
              initial={{ opacity: 0, transform: 'translateY(60px)' }}
              key={action.id}
              transition={{ duration: 0.8 }}
            >
              <VariantRecentActivityRow action={action} countryCode={countryCode} />
            </motion.div>
          ))}
      </div>
    </AnimatePresence>
  )
}
