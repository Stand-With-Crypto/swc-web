'use client'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { RecentActivityRow } from '@/components/app/recentActivityRow/recentActivityRow'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { ExternalLink } from '@/components/ui/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiHomepageCommunityMetrics } from '@/hooks/useApiHomepageCommunityMetrics'
import { SupportedLocale } from '@/intl/locales'
import { cn } from '@/utils/web/cn'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function RecentActivityAndLeaderboard({
  locale,
  defaultValue = RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
  ...data
}: {
  locale: SupportedLocale
  actions: Awaited<ReturnType<typeof getPublicRecentActivity>>
  sumDonationsByUser: SumDonationsByUser
  defaultValue?: RecentActivityAndLeaderboardTabs
}) {
  const { sumDonationsByUser, actions } = useApiHomepageCommunityMetrics(data).data
  const ref = useRef(null)
  const isInVew = useInView(ref, { margin: '-50%', once: true })
  const visibleActions = actions.slice(isInVew ? 0 : 1, actions.length)
  return (
    <Tabs ref={ref} defaultValue={defaultValue} className="mx-auto w-full max-w-2xl">
      <div className="text-center">
        <TabsList className="mx-auto">
          <TabsTrigger value={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}>
            Recent activity
          </TabsTrigger>
          <TabsTrigger value={RecentActivityAndLeaderboardTabs.LEADERBOARD}>
            Top donations
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}>
        <div className="mt-2 h-7" />
        <AnimatePresence initial={false}>
          {visibleActions.map((action, index) => (
            <motion.div
              // we apply individual pb to the elements instead of space-y-7 to ensure that there's no jank in the animation as the height transitions in
              className={cn(index !== 0 && 'pt-7')}
              transition={{ duration: 0.8 }}
              initial={{ opacity: 0, height: 0, transform: 'translateY(20px)' }}
              animate={{ opacity: 1, height: 'inherit', transform: 'translateY(0)' }}
              exit={{ opacity: 0, height: 0 }}
              key={action.id}
            >
              <RecentActivityRow locale={locale} action={action} />
            </motion.div>
          ))}
        </AnimatePresence>
      </TabsContent>
      <TabsContent value={RecentActivityAndLeaderboardTabs.LEADERBOARD} className="space-y-7">
        <p className="mt-2 h-7 text-center text-xs text-gray-500">
          Donations to{' '}
          <ExternalLink
            href={'https://www.axios.com/2023/12/18/crypto-super-pac-fairshake-2024-elections'}
          >
            Fairshake
          </ExternalLink>
          , a pro-crypto Super PAC, are not included on the leaderboard.
        </p>
        {sumDonationsByUser.map((donor, index) => (
          <SumDonationsByUserRow key={index} index={index} sumDonations={donor} locale={locale} />
        ))}
      </TabsContent>
    </Tabs>
  )
}
