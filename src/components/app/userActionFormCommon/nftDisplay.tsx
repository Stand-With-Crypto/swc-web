/* eslint-disable @next/next/no-img-element */
import { NextImage } from '@/components/ui/image'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { Skeleton } from '@/components/ui/skeleton'
import { cva } from 'class-variance-authority'

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
      sm: 'h-20 w-20 rounded-xl',
      md: 'h-40 w-40 rounded-xl',
      lg: 'h-60 w-60 rounded-lg',
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
