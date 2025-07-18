'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import { UserActionFormClaimNFTSkeleton } from '@/components/app/userActionFormClaimNFT/common/skeleton'
import { UserActionFormClaimNFTProps } from '@/components/app/userActionFormClaimNFT/common/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const USUserActionFormClaimNFT = dynamic(() =>
  import('@/components/app/userActionFormClaimNFT/us').then(mod => mod.USUserActionFormClaimNFT),
)

function UserActionFormClaimNFTContent(props: UserActionFormClaimNFTProps) {
  const { countryCode } = props

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return <USUserActionFormClaimNFT {...props} />
    default:
      return gracefullyError({
        msg: `Country implementation not found for UserActionFormClaimNFT`,
        fallback: null,
        hint: {
          level: 'error',
          tags: {
            domain: 'UserActionFormClaimNFT',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}

export function UserActionFormClaimNFT(props: UserActionFormClaimNFTProps) {
  return (
    <Suspense fallback={<UserActionFormClaimNFTSkeleton nftSlug={props.nftSlug} />}>
      <UserActionFormClaimNFTContent {...props} />
    </Suspense>
  )
}
