import 'server-only'

import React from 'react'

import { PseudoDialog } from '@/components/app/homepageDialogDeeplinkLayout/common/pseudoDialog'
import { HomepageDialogDeeplinkLayoutProps } from '@/components/app/homepageDialogDeeplinkLayout/common/types'
import { EuPageHome } from '@/components/app/pageHome/eu'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

const countryCode = SupportedCountryCodes.GB

interface EUHomepageDialogDeeplinkLayoutProps extends HomepageDialogDeeplinkLayoutProps {
  hidePseudoDialog?: boolean
  language: SupportedLanguages
}

export async function EUHomepageDialogDeeplinkLayout({
  language,
  children,
  className,
  hidePseudoDialog,
  size = 'md',
}: EUHomepageDialogDeeplinkLayoutProps) {
  const [topLevelMetrics, recentActivity] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
  ])

  return (
    <>
      {hidePseudoDialog ? (
        children
      ) : (
        <PseudoDialog
          className={className}
          countryCode={countryCode}
          language={language}
          size={size}
        >
          {children}
        </PseudoDialog>
      )}

      <EuPageHome
        language={language}
        recentActivity={recentActivity}
        topLevelMetrics={topLevelMetrics}
      />
    </>
  )
}
