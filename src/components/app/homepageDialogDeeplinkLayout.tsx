import 'server-only'

import React from 'react'
import { X } from 'lucide-react'

import { PageHome } from '@/components/app/pageHome'
import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface HomepageDialogDeeplinkLayoutProps extends React.PropsWithChildren {
  size?: 'sm' | 'md'
  pageParams: Awaited<PageProps['params']>
  hideModal?: boolean
  dialogContentClassName?: string
  className?: string
}

export async function HomepageDialogDeeplinkLayout({
  children,
  size = 'md',
  pageParams,
  dialogContentClassName,
  className,
}: HomepageDialogDeeplinkLayoutProps) {
  const { countryCode } = pageParams
  const urls = getIntlUrls(countryCode)
  const [
    { sumDonations, countUsers, countPolicymakerContacts },
    advocatePerStateDataProps,
    partners,
    leaderboardData,
  ] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getAdvocatesMapData(),
    getPartners({ countryCode }),
    getDistrictsLeaderboardData({ limit: 10 }),
  ])

  return (
    <>
      <InternalLink
        className={cn(dialogOverlayStyles, 'cursor-default')}
        href={urls.home()}
        replace
      />
      <div
        className={cn(
          dialogContentStyles,
          size === 'md' && 'max-w-3xl',
          'min-h-[400px]',
          dialogContentClassName,
          className,
        )}
      >
        <ScrollArea className="overflow-auto md:max-h-[90vh]">{children}</ScrollArea>
        <InternalLink className={dialogCloseStyles} href={urls.home()} replace>
          <X size={20} />
          <span className="sr-only">Close</span>
        </InternalLink>
      </div>

      <PageHome
        actions={[]}
        dtsiHomepagePeople={{ lowestScores: [], highestScores: [] }}
        leaderboardData={leaderboardData.items}
        params={pageParams}
        sumDonationsByUser={[]}
        {...{
          sumDonations,
          countUsers,
          countPolicymakerContacts,
        }}
        advocatePerStateDataProps={advocatePerStateDataProps}
        partners={partners}
      />
    </>
  )
}
