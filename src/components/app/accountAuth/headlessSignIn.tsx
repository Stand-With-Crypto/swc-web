import React from 'react'
import { useEffectOnce } from 'react-use'
import { CrossCircledIcon } from '@radix-ui/react-icons'

import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { cn } from '@/utils/web/cn'

import type { SignatureScreenStatus } from './signatureScreen'

interface HeadlessSignInProps {
  signIn: () => void
  status: SignatureScreenStatus
}

export function HeadlessSignIn({ signIn, status }: HeadlessSignInProps) {
  useEffectOnce(() => {
    signIn()
  })

  return (
    <div className={cn('flex min-h-96 w-full flex-col')}>
      <PageTitle size="sm">Sign in</PageTitle>
      <HeadlessSignInContent status={status} />
    </div>
  )
}

function HeadlessSignInContent({ status }: { status: SignatureScreenStatus }) {
  if (status === 'failed') {
    return (
      <div className="my-auto flex flex-col items-center gap-5">
        <CrossCircledIcon className="h-10 w-10" />
        <PageSubTitle className="text-foreground">Failed to Sign in</PageSubTitle>
      </div>
    )
  }

  return <LoadingOverlay />
}
