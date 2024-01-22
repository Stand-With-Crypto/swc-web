/* eslint-disable @next/next/no-img-element */
import { NextImage } from '@/components/ui/image'
import { Skeleton } from '@/components/ui/skeleton'
import { cva } from 'class-variance-authority'

type NFTDisplaySize = 'sm' | 'md' | 'lg'

interface NFTDisplayProps {
  src: string
  alt: string
  size?: NFTDisplaySize
  className?: string
  raw?: boolean
}

const nftDisplayVariants = cva('overflow-hidden', {
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
  ...props
}: NFTDisplayProps) {
  if (raw) {
    return (
      <div className={nftDisplayVariants({ size, className })}>
        <img alt={alt} {...props} />
      </div>
    )
  }

  return (
    <div className={nftDisplayVariants({ size, className })}>
      <NextImage
        alt={alt}
        {...props}
        width={NFT_IMAGE_SIZE_BY_VARIANT[size]}
        height={NFT_IMAGE_SIZE_BY_VARIANT[size]}
      />
    </div>
  )
}

export function NFTDisplaySkeleton({
  size = 'md',
  className,
}: Pick<NFTDisplayProps, 'size' | 'className'>) {
  return <Skeleton className={nftDisplayVariants({ size, className })} />
}
