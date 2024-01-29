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
      <TabsContent value={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY} className="space-y-7">
        <div className="mt-2 h-7" />
        <AnimatePresence initial={false}>
          {actions.slice(isInVew ? 0 : 1, actions.length).map(action => (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'inherit' }}
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
