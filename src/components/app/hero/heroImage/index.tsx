import { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/dialog'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { Video } from '@/components/ui/video'
import { cn } from '@/utils/web/cn'

interface HeroImageProps {
  children: ReactNode
  className?: string
  /**
   * Fallback content to display while the video is loading or if the browser does not support the video tag.
   */
  fallback?: ReactNode
  videoPath?: string
}

const HeroImage = ({ children, className, fallback, videoPath }: HeroImageProps) => {
  return (
    <LinkBox className="relative h-[320px] overflow-hidden md:rounded-xl lg:h-[400px]">
      <Video
        className={cn('absolute left-0 top-0 h-full w-full object-cover')}
        fallback={fallback}
        poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP0dpm3AgAD5gHXYQBQLgAAAABJRU5ErkJggg=="
        src={videoPath}
      />

      <div
        className={cn(
          'absolute bottom-0 flex w-full items-center justify-between gap-4 p-4 text-sm text-white',
          className,
        )}
        style={{
          background:
            'linear-gradient(to top, hsla(0, 0%, 0%, 0.8) 10%, hsla(0, 0%, 0%, 0.4) 70%,  transparent 100%)',
        }}
      >
        {children}
      </div>
    </LinkBox>
  )
}

export interface HeroImageContentProps {
  title?: string
  ctaText?: string
  imagePath?: {
    src: string
    alt: string
  }
  videoPath?: string
}

export function HeroImageContent({
  ctaText,
  title,
  imagePath = {
    src: '/homepageHero.webp',
    alt: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
  },
  videoPath = 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
}: HeroImageContentProps) {
  return (
    <HeroImage
      className="flex-col sm:flex-row"
      fallback={
        <NextImage
          alt={imagePath.alt}
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOM8FqyAgAEOAHwiAoWHAAAAABJRU5ErkJggg=="
          className="h-full w-full object-cover"
          fill
          placeholder="blur"
          priority
          sizes={'(max-width: 400px) 375px, 500px'}
          src={imagePath.src}
        />
      }
      videoPath={videoPath}
    >
      <p>{title}</p>
      <Button
        className={cn('max-sm:w-full', linkBoxLinkClassName)}
        data-link-box-subject
        variant="secondary"
      >
        {ctaText}
        <ArrowUpRight />
      </Button>
    </HeroImage>
  )
}

export function HeroImageContainer() {
  return (
    <LoginDialogWrapper
      authenticatedContent={
        <UserActionFormShareOnTwitterDialog>
          <HeroImageContent
            ctaText="Follow"
            title="Stay up to date on crypto policy by following @StandWithCrypto on X."
          />
        </UserActionFormShareOnTwitterDialog>
      }
    >
      <HeroImageContent
        ctaText="Join"
        title="Join Stand With Crypto and help us defend your right to own crypto in America."
      />
    </LoginDialogWrapper>
  )
}
