'use client'

import { actionCreateUserActionViewKeyPage } from '@/actions/actionCreateUserActionViewKeyPage'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Status = 'waiting' | 'ready'

export interface CampaignMetadata {
  url: string
}

interface UserActionViewKeyPageDeeplinkLoadingProps {
  campaignMetadata: CampaignMetadata
  campaignName: string
  countryCode: SupportedCountryCodes
  minWaitTimeInSeconds?: number
  pathName: string
}

const MIN_WAIT_TIME_IN_SECONDS = 1

export function UserActionViewKeyPageDeeplinkLoading({
  campaignMetadata,
  campaignName,
  countryCode,
  minWaitTimeInSeconds = MIN_WAIT_TIME_IN_SECONDS,
  pathName,
}: UserActionViewKeyPageDeeplinkLoadingProps) {
  const router = useRouter()

  const [status, setStatus] = useState<Status>('waiting')

  const [actionHasBeenCreated, setActionHasBeenCreated] = useState(false)

  useEffect(() => {
    const minWaitTimeTimeout = setTimeout(() => {
      setStatus('ready')
    }, minWaitTimeInSeconds * 1_000)

    return () => {
      clearInterval(minWaitTimeTimeout)
    }
  }, [])

  useEffect(() => {
    async function runServerAction() {
      if (!actionHasBeenCreated) {
        await actionCreateUserActionViewKeyPage({
          campaignName,
          countryCode,
          path: pathName,
        })

        setActionHasBeenCreated(true)
      }

      if (status === 'ready') {
        router.replace(campaignMetadata.url)
      }
    }

    void runServerAction()
  }, [actionHasBeenCreated])

  return (
    <div className="fixed left-0 top-0 z-50 h-dvh w-full">
      <LoadingOverlay />
    </div>
  )
}
