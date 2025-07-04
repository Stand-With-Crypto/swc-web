import 'server-only'

import React from 'react'

import { PseudoDialog } from '@/components/app/homepageDialogDeeplinkLayout/common/pseudoDialog'
import { HomepageDialogDeeplinkLayoutProps } from '@/components/app/homepageDialogDeeplinkLayout/common/types'
import { UsPageHome } from '@/components/app/pageHome/us'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

interface USHomepageDialogDeeplinkLayoutProps extends HomepageDialogDeeplinkLayoutProps {
  pageParams: Awaited<PageProps['params']>
  hideModal?: boolean
}

export async function USHomepageDialogDeeplinkLayout({
  children,
  size = 'md',
  pageParams,
  className,
}: USHomepageDialogDeeplinkLayoutProps) {
  const [
    { sumDonations, countUsers, countPolicymakerContacts },
    advocatePerStateDataProps,
    partners,
    leaderboardData,
  ] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getAdvocatesMapData({ countryCode }),
    getPartners({ countryCode }),
    getDistrictsLeaderboardData({ limit: 10 }),
  ])

  return (
    <>
      <PseudoDialog className={className} countryCode={countryCode} size={size}>
        {children}
      </PseudoDialog>

      <UsPageHome
        actions={{ count: 0, data: [] }}
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
