import 'server-only'

import React from 'react'

import { PseudoDialog } from '@/components/app/homepageDialogDeeplinkLayout/common/pseudoDialog'
import { HomepageDialogDeeplinkLayoutProps } from '@/components/app/homepageDialogDeeplinkLayout/common/types'
import { GbPageHome } from '@/components/app/pageHome/gb'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getFounders } from '@/utils/server/builder/models/data/founders'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

export async function GBHomepageDialogDeeplinkLayout({
  children,
  size = 'md',
  className,
}: HomepageDialogDeeplinkLayoutProps) {
  const [topLevelMetrics, recentActivity, partners, founders, dtsiHomepagePoliticians] =
    await Promise.all([
      getHomepageTopLevelMetrics(),
      getPublicRecentActivity({
        limit: 10,
        countryCode,
      }),
      getPartners({ countryCode }),
      getFounders({ countryCode }),
      queryDTSIHomepagePeople({ countryCode }),
    ])

  return (
    <>
      <PseudoDialog className={className} countryCode={countryCode} size={size}>
        {children}
      </PseudoDialog>

      <GbPageHome
        dtsiHomepagePoliticians={dtsiHomepagePoliticians}
        founders={founders}
        partners={partners}
        recentActivity={recentActivity}
        topLevelMetrics={topLevelMetrics}
      />
    </>
  )
}
