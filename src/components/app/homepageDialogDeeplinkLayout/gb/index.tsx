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

type GBHomepageDialogDeeplinkLayoutWithDialog = {
  hidePseudoDialog?: false;
} & HomepageDialogDeeplinkLayoutProps;

type GBHomepageDialogDeeplinkLayoutWithoutDialog = {
  hidePseudoDialog: true;
  children: React.ReactNode;
};

type GBHomepageDialogDeeplinkLayoutProps =
  | GBHomepageDialogDeeplinkLayoutWithDialog
  | GBHomepageDialogDeeplinkLayoutWithoutDialog;

export async function GBHomepageDialogDeeplinkLayout({
  children,
  ...props
}: GBHomepageDialogDeeplinkLayoutProps) {
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
      {props.hidePseudoDialog ? (
        children
      ) : (
        <PseudoDialog
          className={props.className}
          countryCode={countryCode}
          size={props.size || 'md'}
        >
          {children}
        </PseudoDialog>
      )}

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
