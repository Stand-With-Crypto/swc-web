import 'server-only'

import React from 'react'

import { PseudoDialog } from '@/components/app/homepageDialogDeeplinkLayout/common/pseudoDialog'
import { HomepageDialogDeeplinkLayoutProps } from '@/components/app/homepageDialogDeeplinkLayout/common/types'
import { GbPageHome } from '@/components/app/pageHome/gb'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

export async function GBHomepageDialogDeeplinkLayout({
  children,
  size = 'md',
  dialogContentClassName,
  className,
}: HomepageDialogDeeplinkLayoutProps) {
  const [topLevelMetrics, recentActivity, partners] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
    getPartners({ countryCode }),
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

      <GbPageHome
        partners={partners}
        recentActivity={recentActivity}
        topLevelMetrics={topLevelMetrics}
      />
    </>
  )
}
