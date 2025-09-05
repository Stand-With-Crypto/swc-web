import 'server-only'

import React from 'react'

import { PseudoDialog } from '@/components/app/homepageDialogDeeplinkLayout/common/pseudoDialog'
import { HomepageDialogDeeplinkLayoutProps } from '@/components/app/homepageDialogDeeplinkLayout/common/types'
import { AuPageHome } from '@/components/app/pageHome/au'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getFounders } from '@/utils/server/builder/models/data/founders'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

export async function AUHomepageDialogDeeplinkLayout({
  children,
  size = 'md',
  className,
}: HomepageDialogDeeplinkLayoutProps) {
  const [
    topLevelMetrics,
    recentActivity,
    partners,
    founders,
    dtsiHomepagePoliticians,
    leaderboardData,
  ] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
    getPartners({ countryCode }),
    getFounders({ countryCode }),
    queryDTSIHomepagePeople({ countryCode }),
    getDistrictsLeaderboardData({ limit: 10, countryCode }),
  ])

  return (
    <>
      <PseudoDialog className={className} countryCode={countryCode} size={size}>
        {children}
      </PseudoDialog>

      <AuPageHome
        dtsiHomepagePoliticians={dtsiHomepagePoliticians}
        founders={founders}
        leaderboardData={leaderboardData.items}
        partners={partners}
        recentActivity={recentActivity}
        topLevelMetrics={topLevelMetrics}
      />
    </>
  )
}
