import { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

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

export interface UnauthenticatedHeroContentProps {
  title?: string
  ctaText?: string
  ctaOverrideLink?: {
    enabled: boolean
    href: string
    text: string
  }
  imagePath?: string
  videoPath?: string
}

export const UnauthenticatedHeroContent = ({
  title = 'Join Stand With Crypto and help us defend your right to own crypto in America.',
  ctaText = 'Join',
  imagePath = '/homepageHero.webp',
  videoPath = 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
  ctaOverrideLink,
}: UnauthenticatedHeroContentProps) => {
  const ctaElement =
    ctaOverrideLink?.enabled && ctaOverrideLink?.href && ctaOverrideLink?.text ? (
      <Link href={ctaOverrideLink.href} target="_blank">
        <Button
          className={cn('max-sm:w-full', linkBoxLinkClassName)}
          data-link-box-subject
          variant="secondary"
        >
          {ctaOverrideLink.text}
          <ArrowUpRight />
        </Button>
      </Link>
    ) : (
      <Button className={linkBoxLinkClassName} data-link-box-subject variant="secondary">
        {ctaText}
        <ArrowUpRight />
      </Button>
    )

  return (
    <HeroImage
      fallback={
        <NextImage
          alt="sign up"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOM8FqyAgAEOAHwiAoWHAAAAABJRU5ErkJggg=="
          className="h-full w-full object-cover"
          fill
          placeholder="blur"
          priority
          sizes={'(max-width: 400px) 375px, 500px'}
          src={imagePath}
        />
      }
      videoPath={videoPath}
    >
      <p>{title}</p>
      {ctaElement}
    </HeroImage>
  )
}

export interface AuthenticatedHeroContentProps {
  title?: string
  ctaText?: string
  ctaOverrideLink?: {
    enabled: boolean
    href: string
    text: string
  }
  imagePath?: string
  videoPath?: string
}

const AuthenticatedHeroContent = ({
  title = 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
  ctaText = 'Follow',
  imagePath = '/homepageHero.webp',
  videoPath = 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
  ctaOverrideLink,
}: AuthenticatedHeroContentProps) => {
  const ctaElement =
    ctaOverrideLink?.enabled && ctaOverrideLink?.href && ctaOverrideLink?.text ? (
      <Link href={ctaOverrideLink.href} target="_blank">
        <Button
          className={cn('max-sm:w-full', linkBoxLinkClassName)}
          data-link-box-subject
          variant="secondary"
        >
          {ctaOverrideLink.text}
          <ArrowUpRight />
        </Button>
      </Link>
    ) : (
      <Button
        className={cn('max-sm:w-full', linkBoxLinkClassName)}
        data-link-box-subject
        variant="secondary"
      >
        {ctaText}
        <ArrowUpRight />
      </Button>
    )
  return (
    <UserActionFormShareOnTwitterDialog>
      {/* This div is here because the dialog won't open on builder.io without it*/}
      <div>
        <HeroImage
          className="flex-col sm:flex-row"
          fallback={
            <NextImage
              alt="Stay up to date on crypto policy by following @StandWithCrypto on X."
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOM8FqyAgAEOAHwiAoWHAAAAABJRU5ErkJggg=="
              className="h-full w-full object-cover"
              fill
              placeholder="blur"
              priority
              sizes={'(max-width: 400px) 375px, 500px'}
              src={imagePath}
            />
          }
          videoPath={videoPath}
        >
          <p>{title}</p>
          {ctaElement}
        </HeroImage>
      </div>
    </UserActionFormShareOnTwitterDialog>
  )
}

export interface HeroImageWrapperProps {
  unauthenticatedProps?: UnauthenticatedHeroContentProps
  authenticatedProps?: AuthenticatedHeroContentProps
}

export function HeroImageContainer({
  unauthenticatedProps,
  authenticatedProps,
}: HeroImageWrapperProps) {
  return (
    <LoginDialogWrapper authenticatedContent={<AuthenticatedHeroContent {...authenticatedProps} />}>
      {/* This div is here because the dialog won't open on builder.io without it*/}
      <div>
        <UnauthenticatedHeroContent {...unauthenticatedProps} />
      </div>
    </LoginDialogWrapper>
  )
}
