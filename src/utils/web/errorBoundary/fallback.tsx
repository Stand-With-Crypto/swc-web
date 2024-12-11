'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'

export function ErrorFallbackComponent() {
  const router = useRouter()

  return (
    <div className="mx-auto flex max-w-[460px] flex-col items-center gap-2">
      <div className="flex flex-col items-center space-y-6 pt-6">
        <NextImage
          alt="Stand With Crypto Logo"
          height={80}
          priority
          src="/error_shield.svg"
          width={80}
        />

        <div className="space-y-4">
          <PageTitle size="sm">Something went wrong</PageTitle>
        </div>
      </div>

      <div className="flex w-full items-center justify-center pb-6">
        <Button
          onClick={() => {
            router.refresh()
          }}
          variant="secondary"
        >
          Please try again
        </Button>
      </div>
    </div>
  )
}
