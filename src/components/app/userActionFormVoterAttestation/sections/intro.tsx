'use client'
import React from 'react'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'
import { DialogFooterSection } from '@/components/app/userActionFormVoterAttestation/dialogFooterSection'
import { NFTDisplay } from '@/components/app/userActionFormVoterAttestation/sections/nftDisplay'
import { Button } from '@/components/ui/button'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { cn } from '@/utils/web/cn'

interface IntroProps {
  onContinue: () => void
  isLoading?: boolean
}

export function Intro({ onContinue, isLoading }: IntroProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [ref])
  return (
    <IntroStaticContent nftDisplay={<NFTDisplay locked={true} />}>
      <Button className="w-full" disabled={isLoading} onClick={onContinue} ref={ref}>
        {isLoading ? 'Loading...' : 'Get started'}
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
      <UserActionFormLayout.Container className={cn(dialogContentPaddingStyles, 'mb-10')}>
        {nftDisplay}

        <UserActionFormLayout.Heading
          subtitle="This is a critical election for crypto, and Stand With Crypto wants to help you cast an informed ballot. If you're eligible, pledge to do your research and cast your ballot this fall. We'll send you a free NFT."
          title="Pledge to vote this fall and get a free NFT"
        />
      </UserActionFormLayout.Container>
      <DialogFooterSection elevate={false}>
        <div className="mx-auto w-full max-w-64">{children}</div>
      </DialogFooterSection>
    </UserActionFormLayout>
  )
}
