'use client'
import React from 'react'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Video } from '@/components/ui/video'

interface IntroProps {
  onContinue: () => void
}

export function Intro({ onContinue }: IntroProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [ref])
  return (
    <IntroStaticContent
      nftDisplay={
        <Video
          className={'mx-auto w-full max-w-96 overflow-hidden rounded-xl object-cover'}
          fallback={
            <Skeleton
              className={'mx-auto h-44 w-full max-w-96 overflow-hidden rounded-xl object-cover'}
            />
          }
          src="/actionTypeVideos/voterAttestationBanner.mp4"
        />
      }
    >
      <Button className="w-full" onClick={onContinue} ref={ref}>
        Get started
      </Button>
    </IntroStaticContent>
  )
}

export function IntroStaticContent({
  children,
  nftDisplay,
}: React.PropsWithChildren<{ nftDisplay: React.ReactNode }>) {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container className="mb-24">
        {nftDisplay}

        <UserActionFormLayout.Heading
          subtitle="This is a critical election for crypto, and Stand With Crypto wants to help you cast an informed ballot. If you're eligible, pledge to do your research and cast your ballot this fall. We'll send you a free NFT."
          title="Pledge to vote this fall and get a free NFTs"
        />
      </UserActionFormLayout.Container>
      <UserActionFormLayout.Footer>
        <div className="mx-auto w-full max-w-64">{children}</div>
      </UserActionFormLayout.Footer>
    </UserActionFormLayout>
  )
}
