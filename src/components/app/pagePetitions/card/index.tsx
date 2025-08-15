'use client'

import { useState } from 'react'
import Link from 'next/link'

import { FormattedNumber } from '@/components/ui/formattedNumber'
import { NextImage } from '@/components/ui/image'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { cn } from '@/utils/web/cn'

interface PetitionCardProps {
  title: string
  description: string
  signaturesCount: number
  href: string
  imgSrc?: string
  locale?: SupportedLocale
  className?: string
}

const DESKTOP_IMAGE_SIZE = 166
const MOBILE_IMAGE_SIZE = 64
const FALLBACK_IMAGE_PATH = '/activityFeedIcons/petition.svg'

export function PetitionCard({
  title,
  description,
  signaturesCount,
  imgSrc,
  href,
  locale = SupportedLocale.EN_US,
  className,
}: PetitionCardProps) {
  const [imageError, setImageError] = useState(false)
  const showImage = imgSrc && !imageError

  return (
    <Link
      className={cn(
        'block cursor-pointer rounded-3xl bg-white shadow-md transition-shadow hover:shadow-xl',
        'w-full border-t border-gray-100',
        'grid max-lg:grid-cols-[1fr_128px]',
        'lg:grid-rows-[224px_1fr]',
        className,
      )}
      href={href}
    >
      <div className="relative max-lg:order-2 lg:h-auto">
        {showImage ? (
          <NextImage
            alt={title}
            className="h-full w-full object-cover max-lg:rounded-br-3xl max-lg:rounded-tr-3xl lg:rounded-tl-3xl lg:rounded-tr-3xl"
            fill
            onError={() => setImageError(true)}
            src={imgSrc}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(74.32%_74.32%_at_50.00%_50.00%,#F0E8FF_8.5%,#6B28FF_89%)] px-5 py-9 max-lg:rounded-br-3xl max-lg:rounded-tr-3xl lg:rounded-tl-3xl lg:rounded-tr-3xl">
            <NextImage
              alt="Petition"
              className="hidden lg:block"
              height={DESKTOP_IMAGE_SIZE}
              src={FALLBACK_IMAGE_PATH}
              width={DESKTOP_IMAGE_SIZE}
            />
            <NextImage
              alt="Petition"
              className="lg:hidden"
              height={MOBILE_IMAGE_SIZE}
              src={FALLBACK_IMAGE_PATH}
              width={MOBILE_IMAGE_SIZE}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex flex-col gap-4 p-6 max-lg:gap-3 max-lg:p-4">
          <h3 className="line-clamp-2 text-[20px] font-bold leading-tight text-foreground max-lg:text-base">
            {title}
          </h3>
          <p className="text-md line-clamp-3 text-muted-foreground max-lg:line-clamp-2 max-lg:text-sm">
            {description}
          </p>
        </div>
        <div className="mt-auto border-muted p-6 text-[20px] font-medium text-foreground max-lg:p-4 max-lg:text-base lg:border-t">
          <FormattedNumber amount={signaturesCount} locale={locale} /> signatures
        </div>
      </div>
    </Link>
  )
}
