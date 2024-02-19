'use client'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'

import {
  RecentActivityRow,
  RecentActivityRowProps,
} from '@/components/app/recentActivityRow/recentActivityRow'
import { useLocale } from '@/hooks/useLocale'
import { SupportedLocale } from '@/intl/locales'
import { useThrottledActionUpdates } from '@/hooks/useThrottledActionUpdates'

function AnimatedActivityRow({
  action,
  locale,
}: {
  action: RecentActivityRowProps['action']
  locale: SupportedLocale
}) {
  const isPresent = useIsPresent()

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
      opacity: { duration: 1.15 },
    },
  }

  return (
    <motion.div
      {...rowAnimation}
      style={{ position: isPresent ? 'static' : 'absolute' }}
      key={action.id}
      layout
      className="relative pt-8 lg:pt-10"
    >
      <RecentActivityRow action={action} locale={locale} />
      <motion.div {...glowAnimation} className="absolute -mt-6 h-4 w-full blur-2xl" />
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
        {throttledActions.map(action => (
          <AnimatedActivityRow key={action.id} action={action} locale={locale} />
        ))}
      </div>
    </AnimatePresence>
  )
}
