'use client'
import { AnimatePresence, motion } from 'framer-motion'

import { RecentActivityRowProps } from '@/components/app/recentActivityRow/recentActivityRow'
import { VariantRecentActivityRow } from '@/components/app/recentActivityRow/variantRecentActivityRow'
import { useLocale } from '@/hooks/useLocale'
import { useThrottledActionUpdates } from '@/hooks/useThrottledActionUpdates'
import { SupportedLocale } from '@/intl/locales'
import { cn } from '@/utils/web/cn'

type AnimatedActivityRowProps = React.HTMLAttributes<HTMLDivElement> & {
  action: RecentActivityRowProps['action']
  locale: SupportedLocale
}

function AnimatedActivityRow({ action, className, locale }: AnimatedActivityRowProps) {
  const rowAnimation = {
    initial: { scale: 0.75, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0, y: 100 },
    transition: {
      type: 'spring',
      stiffness: 600,
      damping: 50,
      opacity: { duration: 0.3 },
    },
  }

  const glowAnimation = {
    initial: { backgroundColor: '#2C5DF5', opacity: 0.65, scale: 0 },
    animate: { scale: 1, opacity: 0 },
    transition: {
      type: 'spring',
      stiffness: 900,
      damping: 40,
      opacity: { duration: 1.75 },
    },
  }

  return (
    <motion.div {...rowAnimation} className={cn('relative', className)} layout>
      <VariantRecentActivityRow action={action} key={action.id} locale={locale} />
      <motion.div {...glowAnimation} className="absolute -mt-6 h-3 w-full blur-2xl lg:h-4" />
    </motion.div>
  )
}

export function RecentActivityRowAnimatedContainer({
  actions,
}: {
  actions: RecentActivityRowProps['action'][]
}) {
  const throttledActions = useThrottledActionUpdates(actions)
  const locale = useLocale()

  return (
    <AnimatePresence initial={false}>
      <div className="relative">
        {throttledActions.map((action, index) => (
          <AnimatedActivityRow
            action={action}
            className={cn(index !== 0 && 'pt-8 lg:pt-10')}
            key={action.id}
            locale={locale}
          />
        ))}
      </div>
    </AnimatePresence>
  )
}
