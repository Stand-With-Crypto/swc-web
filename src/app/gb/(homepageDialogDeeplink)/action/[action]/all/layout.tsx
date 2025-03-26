import React from 'react'
import { UserActionType } from '@prisma/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { GBHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/gb'
import { validatePageProps } from '@/components/app/pageAllActionsDeeplink/validatePageProps'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

export const dynamic = 'error'

type UserActionCampaignsLayoutProps = React.PropsWithChildren<PageProps<{ action: UserActionType }>>

export async function generateMetadata(props: UserActionCampaignsLayoutProps): Promise<Metadata> {
  const { cta } = await validatePageProps({
    ...props,
    countryCode,
  })

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

  const { isNotFound } = await validatePageProps({
    ...props,
    countryCode,
  })

  if (isNotFound) {
    notFound()
  }

  return (
    <GBHomepageDialogDeeplinkLayout className="min-h-28 max-w-2xl">
      <React.Suspense>{children}</React.Suspense>
    </GBHomepageDialogDeeplinkLayout>
  )
}
