'use client'
import dynamic from 'next/dynamic'

import { UserActionFormClaimNFTSkeleton } from '@/components/app/userActionFormClaimNFT/common/skeleton'
import { UserActionFormClaimNFTProps } from '@/components/app/userActionFormClaimNFT/common/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { Suspense, useMemo } from 'react'

const USUserActionFormClaimNFT = dynamic(() =>
  import('@/components/app/userActionFormClaimNFT/us').then(mod => mod.USUserActionFormClaimNFT),
)

export function UserActionFormClaimNFT(props: UserActionFormClaimNFTProps) {
  const { countryCode } = props

  const LazyUserActionFormClaimNFT = useMemo(() => {
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
  }, [countryCode, props])

  return (
    <Suspense fallback={<UserActionFormClaimNFTSkeleton nftSlug={props.nftSlug} />}>
      {LazyUserActionFormClaimNFT}
    </Suspense>
  )
}
