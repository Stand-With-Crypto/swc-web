import React from 'react'
import { UserActionType } from '@prisma/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export const dynamic = 'error'

type UserActionCampaignsLayoutProps = React.PropsWithChildren<PageProps<{ action: UserActionType }>>

export async function generateMetadata(props: UserActionCampaignsLayoutProps): Promise<Metadata> {
  const { action } = await props.params
  const parsedAction = action?.toUpperCase()

  const cta = getUserActionCTAsByCountry(countryCode)[parsedAction]

  if (cta) {
    return generateMetadataDetails({
      title: cta.title,
    })
  }

  return generateMetadataDetails({
    title: 'Campaigns',
  })
}

export default async function UserActionCampaignsLayout(props: UserActionCampaignsLayoutProps) {
  const { children } = props
  const params = await props.params
  const parsedAction = params.action?.toUpperCase()

  const cta = getUserActionCTAsByCountry(countryCode)[parsedAction]

  const hasActiveCampaigns = cta?.campaigns?.some(campaign => campaign.isCampaignActive)

  if (!params.action || !cta || !hasActiveCampaigns) {
    notFound()
  }

  return (
    <USHomepageDialogDeeplinkLayout className="min-h-28 max-w-2xl" pageParams={params}>
      <React.Suspense>{children}</React.Suspense>
    </USHomepageDialogDeeplinkLayout>
  )
}
