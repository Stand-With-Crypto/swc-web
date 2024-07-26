/* eslint-disable @next/next/no-img-element */
import { cva } from 'class-variance-authority'
import { MediaRenderer } from 'thirdweb/react'

import { NextImage } from '@/components/ui/image'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { Skeleton } from '@/components/ui/skeleton'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'

type NFTDisplaySize = 'sm' | 'md' | 'lg'

interface NFTDisplayProps {
  src: string
  alt: string
  size?: NFTDisplaySize
  className?: string
  raw?: boolean
  isThirdwebMedia?: boolean
  loading?: boolean
}

const nftDisplayVariants = cva('overflow-hidden relative', {
  variants: {
    size: {
      sm: 'w-20 h-20 min-w-20 rounded-xl',
      md: 'w-40 h-40 min-w-40 rounded-xl',
      lg: 'w-40 h-40 min-w-40 md:w-60 md:min-w-60 md:h-60 rounded-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const NFT_IMAGE_SIZE_BY_VARIANT: Record<NFTDisplaySize, number> = {
  sm: 80,
  md: 160,
  lg: 240,
}

export function NFTDisplay({
  size = 'md',
  className,
  raw = false,
  alt,
  loading,
  isThirdwebMedia = false,
  ...props
}: NFTDisplayProps) {
  if (loading) {
    return <LoadingOverlay size="sm" />
  }

  function getNFTImageComponent() {
    if (isThirdwebMedia) {
      return (
        <MediaRenderer
          alt={alt}
          client={thirdwebClient}
          height={`${NFT_IMAGE_SIZE_BY_VARIANT[size]}px`}
          width={`${NFT_IMAGE_SIZE_BY_VARIANT[size]}px`}
          {...props}
        />
      )
    }

    if (raw) {
      return <img alt={alt} {...props} />
    }

    return (
      <NextImage
        alt={alt}
        {...props}
        height={NFT_IMAGE_SIZE_BY_VARIANT[size]}
        width={NFT_IMAGE_SIZE_BY_VARIANT[size]}
      />
    )
  }

  return <div className={nftDisplayVariants({ size, className })}>{getNFTImageComponent()}</div>
}

export function NFTDisplaySkeleton({
  size = 'md',
  className,
}: Pick<NFTDisplayProps, 'size' | 'className'>) {
  return <Skeleton className={nftDisplayVariants({ size, className })} />
}
