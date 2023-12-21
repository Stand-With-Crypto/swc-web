'use client'

import { AggregateDonationsRow } from '@/components/app/aggregateDonationsRow/aggregateDonationsRow'
import { RecentActivityRow } from '@/components/app/recentActivity/recentActivityRow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AggregateDonationsByUser } from '@/data/donations/getAggregateDonationsByUser'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { PageProps } from '@/types'

// TODO metadata

export function RecentActivityAndLeaderboard({
  params,
  actions,
  topDonors,
}: PageProps & {
  actions: Awaited<ReturnType<typeof getPublicRecentActivity>>
  topDonors: AggregateDonationsByUser
}) {
  const { locale } = params
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
        {topDonors.map((donor, index) => (
          <AggregateDonationsRow
            key={index}
            index={index}
            aggregateDonations={donor}
            locale={locale}
          />
        ))}
      </TabsContent>
    </Tabs>
  )
}
