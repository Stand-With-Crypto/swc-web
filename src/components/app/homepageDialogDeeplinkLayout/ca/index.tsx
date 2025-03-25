import 'server-only'

import React from 'react'

import { PseudoDialog } from '@/components/app/homepageDialogDeeplinkLayout/common/pseudoDialog'
import { HomepageDialogDeeplinkLayoutProps } from '@/components/app/homepageDialogDeeplinkLayout/common/types'
import { CaPageHome } from '@/components/app/pageHome/ca'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getFounders } from '@/utils/server/builder/models/data/founders'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export async function CAHomepageDialogDeeplinkLayout({
  children,
  size = 'md',
  dialogContentClassName,
  className,
}: HomepageDialogDeeplinkLayoutProps) {
  const [topLevelMetrics, recentActivity, partners, founders] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
    getPartners({ countryCode }),
    getFounders({ countryCode }),
  ])

  return (
    <>
      <PseudoDialog
        className={className}
        countryCode={countryCode}
        dialogContentClassName={dialogContentClassName}
        size={size}
      >
        {children}
      </PseudoDialog>

      <CaPageHome
        founders={founders}
        partners={partners}
        recentActivity={recentActivity}
        topLevelMetrics={topLevelMetrics}
      />
    </>
  )
}
