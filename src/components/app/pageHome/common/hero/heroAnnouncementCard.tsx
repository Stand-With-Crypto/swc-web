import { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { Video } from '@/components/ui/video'
import { cn } from '@/utils/web/cn'

interface HeroAnnouncementCardProps {
  authenticatedContent: ReactNode
  unauthenticatedContent: ReactNode
}

interface ImageMedia {
  src: string
  alt: string
}

interface VideoMedia {
  videoSrc: string
  fallback: ImageMedia
}

type Media = ImageMedia | VideoMedia

interface HeroImageProps {
  children: ReactNode
  media: Media
}

export function HeroAnnouncementCard({
  authenticatedContent,
  unauthenticatedContent,
}: HeroAnnouncementCardProps) {
  return (
    <div className="order-0 self-start md:container lg:order-1 lg:col-span-2 lg:px-0">
      <LoginDialogWrapper authenticatedContent={authenticatedContent}>
        {unauthenticatedContent}
      </LoginDialogWrapper>
    </div>
  )
}

function HeroAnnouncementCardImage({ children, media }: HeroImageProps) {
  return (
    <LinkBox className="relative h-[320px] overflow-hidden md:rounded-3xl lg:h-[400px]">
      {'videoSrc' in media ? (
        <Video
          className={cn('absolute left-0 top-0 h-full w-full object-cover')}
          fallback={
            <NextImage
              alt={media.fallback.alt}
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOM8FqyAgAEOAHwiAoWHAAAAABJRU5ErkJggg=="
              className="h-full w-full object-cover"
              fill
              placeholder="blur"
              priority
              sizes={'(max-width: 400px) 375px, 500px'}
              src={media.fallback.src}
            />
          }
          poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP0dpm3AgAD5gHXYQBQLgAAAABJRU5ErkJggg=="
          src={media.videoSrc}
        />
      ) : (
        <NextImage
          alt={media.alt}
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOM8FqyAgAEOAHwiAoWHAAAAABJRU5ErkJggg=="
          className="h-full w-full object-cover"
          fill
          placeholder="blur"
          priority
          sizes={'(max-width: 400px) 375px, 500px'}
          src={media.src}
        />
      )}

      <div
        className="absolute bottom-0 flex w-full items-center justify-between gap-4 p-5 pt-10 text-sm text-white"
        style={{
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.44) 50%, rgba(0, 0, 0, 0.00) 100%)',
        }}
      >
        {children}
      </div>
    </LinkBox>
  )
}
HeroAnnouncementCard.Image = HeroAnnouncementCardImage

function HeroAnnouncementCardCTA({
  children,
  buttonText,
}: React.PropsWithChildren<{ buttonText: string }>) {
  return (
    <>
      <p className="max-sm:flex-[2]">{children}</p>
      <Button
        className={cn('max-sm:flex-1', linkBoxLinkClassName)}
        data-link-box-subject
        size="sm"
        variant="secondary"
      >
        {buttonText} <ArrowUpRight />
      </Button>
    </>
  )
}
HeroAnnouncementCard.CTA = HeroAnnouncementCardCTA
