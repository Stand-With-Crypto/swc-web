'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { actionCreateUserActionViewKeyPage } from '@/actions/actionCreateUserActionViewKeyPage'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type Status = 'waiting' | 'ready'

export interface CampaignMetadata {
  url: string
}

interface UserActionViewKeyPageDeeplinkLoadingProps {
  campaignMetadata: CampaignMetadata
  campaignName: string
  countryCode: SupportedCountryCodes
  minWaitTimeInSeconds?: number
}

const MIN_WAIT_TIME_IN_SECONDS = 1

export function UserActionViewKeyPageDeeplinkRedirect({
  campaignMetadata,
  campaignName,
  countryCode,
  minWaitTimeInSeconds = MIN_WAIT_TIME_IN_SECONDS,
}: UserActionViewKeyPageDeeplinkLoadingProps) {
  const router = useRouter()

  const [status, setStatus] = useState<Status>('waiting')

  const [actionHasBeenCreated, setActionHasBeenCreated] = useState(false)

  useTimeout(() => setStatus('ready'), minWaitTimeInSeconds)

  useEffect(() => {
    async function runServerAction() {
      if (!actionHasBeenCreated) {
        await actionCreateUserActionViewKeyPage({
          campaignName,
          countryCode,
          path: campaignMetadata.url,
        })

        setActionHasBeenCreated(true)
      }

      if (status === 'ready') {
        router.replace(campaignMetadata.url)
      }
    }

    void runServerAction()
  }, [actionHasBeenCreated, campaignMetadata, campaignName, countryCode, router, status])

  return (
    <div className="fixed left-0 top-0 z-50 h-dvh w-full">
      <LoadingOverlay />
    </div>
  )
}

function useTimeout(callback: () => void, delayInSeconds: number) {
  useEffect(() => {
    const timeoutRef = setTimeout(callback, delayInSeconds * 1_000)

    return () => {
      clearTimeout(timeoutRef)
    }
  }, [callback, delayInSeconds])
}
