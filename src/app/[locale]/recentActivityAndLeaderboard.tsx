'use client'

import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { RecentActivityRow } from '@/components/app/recentActivity/recentActivityRow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedLocale } from '@/intl/locales'
import { PageProps } from '@/types'

// TODO metadata

export function RecentActivityAndLeaderboard({
  locale,
  actions,
  sumDonationsByUser,
}: {
  locale: SupportedLocale
  actions: Awaited<ReturnType<typeof getPublicRecentActivity>>
  sumDonationsByUser: SumDonationsByUser
}) {
  return (
    <Tabs defaultValue="recentActivity" className="mx-auto w-full max-w-2xl">
      <div className="text-center">
        <TabsList className="mx-auto">
          <TabsTrigger value="recentActivity">Recent activity</TabsTrigger>
          <TabsTrigger value="topDonations">Top donations</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="recentActivity" className="space-y-7">
        <div className="mt-2 h-7" />
        {actions.map(action => (
          <RecentActivityRow locale={locale} action={action} key={action.id} />
        ))}
      </TabsContent>
      <TabsContent value="topDonations" className="space-y-7">
        {/* TODO tooltip for Fairshake */}
        <p className="mt-2 h-7 text-center text-xs text-gray-500">
          Donations are from FairShake and Stand With Crypto
        </p>
        {sumDonationsByUser.map((donor, index) => (
          <SumDonationsByUserRow key={index} index={index} sumDonations={donor} locale={locale} />
        ))}
      </TabsContent>
    </Tabs>
  )
}
