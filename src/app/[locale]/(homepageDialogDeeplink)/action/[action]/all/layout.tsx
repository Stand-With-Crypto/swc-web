import React from 'react'
import { UserActionType } from '@prisma/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { USER_ACTION_CTAS_FOR_GRID_DISPLAY } from '@/components/app/userActionGridCTAs/constants/ctas'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

type UserActionCampaignsLayoutProps = React.PropsWithChildren<PageProps<{ action: UserActionType }>>

export async function generateMetadata({
  params,
}: UserActionCampaignsLayoutProps): Promise<Metadata> {
  const { action } = params
  const parsedAction = action?.toUpperCase()

  const cta = USER_ACTION_CTAS_FOR_GRID_DISPLAY[parsedAction]

  if (cta) {
    return generateMetadataDetails({
      title: cta.title,
    })
  }

  return generateMetadataDetails({
    title: 'Campaigns',
  })
}

export default async function UserActionCampaignsLayout({
  params,
  children,
}: UserActionCampaignsLayoutProps) {
  const { action } = params
  const parsedAction = action?.toUpperCase()

  const cta = USER_ACTION_CTAS_FOR_GRID_DISPLAY[parsedAction]

  const hasActiveCampaigns = cta?.campaigns?.some(campaign => campaign.isCampaignActive)

  if (!action || !cta || !hasActiveCampaigns) {
    notFound()
  }

  return (
    <HomepageDialogDeeplinkLayout dialogContentClassName="min-h-28 max-w-2xl" pageParams={params}>
      <React.Suspense>{children}</React.Suspense>
    </HomepageDialogDeeplinkLayout>
  )
}
