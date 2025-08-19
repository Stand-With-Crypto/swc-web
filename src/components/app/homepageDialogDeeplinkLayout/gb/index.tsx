import 'server-only'

import React from 'react'

import { PseudoDialog } from '@/components/app/homepageDialogDeeplinkLayout/common/pseudoDialog'
import { HomepageDialogDeeplinkLayoutProps } from '@/components/app/homepageDialogDeeplinkLayout/common/types'
import { GbPageHome } from '@/components/app/pageHome/gb'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData, getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getFounders } from '@/utils/server/builder/models/data/founders'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

interface GBHomepageDialogDeeplinkLayoutProps extends HomepageDialogDeeplinkLayoutProps {
  hidePseudoDialog?: boolean
}

export async function GBHomepageDialogDeeplinkLayout({
  children,
  className,
  hidePseudoDialog,
  size = 'md',
}: GBHomepageDialogDeeplinkLayoutProps) {
  const [
    asyncProps,
    advocatePerStateDataProps,
    topLevelMetrics,
    partners,
    founders,
    dtsiHomepagePoliticians,
  ] = await Promise.all([
    getHomepageData({
      recentActivityLimit: 30,
      countryCode,
    }),
    getAdvocatesMapData({ countryCode }),
    getHomepageTopLevelMetrics(),
    getPartners({ countryCode }),
    getFounders({ countryCode }),
    queryDTSIHomepagePeople({ countryCode }),
  ])

  return (
    <>
      {hidePseudoDialog ? (
        children
      ) : (
        <PseudoDialog className={className} countryCode={countryCode} size={size}>
          {children}
        </PseudoDialog>
      )}

      <GbPageHome
        advocatePerStateDataProps={advocatePerStateDataProps}
        dtsiHomepagePoliticians={dtsiHomepagePoliticians}
        founders={founders}
        partners={partners}
        topLevelMetrics={topLevelMetrics}
        {...asyncProps}
      />
    </>
  )
}
