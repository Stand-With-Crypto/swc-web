'use client'

import { useEffect } from 'react'

import { actionCreateUserActionViewKeyPage } from '@/actions/actionCreateUserActionViewKeyPage'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface CampaignMetadata {
  url: string
}

interface UserActionViewKeyPageDeeplinkLoadingProps {
  campaignMetadata: CampaignMetadata
  campaignName: string
  countryCode: SupportedCountryCodes
}

export function UserActionViewKeyPageDeeplinkRedirect({
  campaignMetadata,
  campaignName,
  countryCode,
}: UserActionViewKeyPageDeeplinkLoadingProps) {
  useEffect(() => {
    void actionCreateUserActionViewKeyPage({
      campaignName,
      countryCode,
      path: campaignMetadata.url,
    }).then(() => {
      window.location.href = campaignMetadata.url
    })
  }, [campaignMetadata, campaignName, countryCode])

  return (
    <div className="fixed left-0 top-0 z-50 h-dvh w-full">
      <LoadingOverlay />
    </div>
  )
}
