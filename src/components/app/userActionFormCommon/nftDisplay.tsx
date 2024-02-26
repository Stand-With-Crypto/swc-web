/* eslint-disable @next/next/no-img-element */
import { cva } from 'class-variance-authority'

import { NextImage } from '@/components/ui/image'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { Skeleton } from '@/components/ui/skeleton'

type NFTDisplaySize = 'sm' | 'md' | 'lg'

interface NFTDisplayProps {
  src: string
  alt: string
  size?: NFTDisplaySize
  className?: string
  raw?: boolean
  loading?: boolean
}

const nftDisplayVariants = cva('overflow-hidden relative', {
  variants: {
    size: {
      sm: 'max-w-20 max-h-20 rounded-xl',
      md: 'max-w-40 max-h-40 rounded-xl',
      lg: 'max-w-40 max-h-40 md:max-w-60 md:max-h-60 rounded-lg',
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
  ...props
}: NFTDisplayProps) {
  return (
    <div className={nftDisplayVariants({ size, className })}>
      {loading && <LoadingOverlay size="sm" />}
      {raw ? (
        <img alt={alt} {...props} />
      ) : (
        <NextImage
          alt={alt}
          {...props}
          height={NFT_IMAGE_SIZE_BY_VARIANT[size]}
          width={NFT_IMAGE_SIZE_BY_VARIANT[size]}
        />
      )}
    </div>
  )
}

export function NFTDisplaySkeleton({
  size = 'md',
  className,
}: Pick<NFTDisplayProps, 'size' | 'className'>) {
  return <Skeleton className={nftDisplayVariants({ size, className })} />
}
