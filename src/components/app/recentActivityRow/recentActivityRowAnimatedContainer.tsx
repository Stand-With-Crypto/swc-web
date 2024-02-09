'use client'
import {
  RecentActivityRow,
  RecentActivityRowProps,
} from '@/components/app/recentActivityRow/recentActivityRow'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/utils/web/cn'
import { AnimatePresence, motion } from 'framer-motion'

export function RecentActivityRowAnimatedContainer({
  actions,
}: {
  actions: RecentActivityRowProps['action'][]
}) {
  const locale = useLocale()
  return (
    <AnimatePresence initial={false}>
      <motion.div>
        {actions.map((action, index) => (
          <motion.div
            // we apply individual pb to the elements instead of space-y-7 to ensure that there's no jank in the animation as the height transitions in
            animate={{ opacity: 1, transform: 'translateY(0)' }}
            className={cn(index !== 0 && 'pt-8 lg:pt-10')}
            initial={{ opacity: 0, transform: 'translateY(60px)' }}
            key={action.id}
            transition={{ duration: 0.8 }}
          >
            <RecentActivityRow action={action} locale={locale} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
