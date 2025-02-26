import { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/dialog'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { VideoPlayer } from '@/components/ui/video'
import { cn } from '@/utils/web/cn'

interface HeroImageProps {
  children: ReactNode
  className?: string
  /**
   * Fallback content to display while the video is loading or if the browser does not support the video tag.
   */
  fallback?: ReactNode
}

const HeroImage = ({ children, className, fallback }: HeroImageProps) => {
  return (
    <LinkBox className="relative h-[320px] overflow-hidden md:rounded-xl lg:h-[400px]">
      <VideoPlayer
        autoplay
        className={cn('absolute left-0 top-0')}
        fallback={fallback}
        fit="cover"
        loadingFallback={
          <NextImage
            alt="loading"
            className="h-full w-full object-cover"
            fill
            priority
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOM8FqyAgAEOAHwiAoWHAAAAABJRU5ErkJggg=="
          />
        }
        loop
        muted
        type="video"
        url="https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4"
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

const unauthenticatedContent = (
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
        src="/homepageHero.webp"
      />
    }
  >
    <p>Join Stand With Crypto and help us defend your right to own crypto in America.</p>
    <Button className={linkBoxLinkClassName} data-link-box-subject variant="secondary">
      Join
      <ArrowUpRight />
    </Button>
  </HeroImage>
)

const authenticatedContent = (
  <UserActionFormShareOnTwitterDialog>
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
          src="/homepageHero.webp"
        />
      }
    >
      <p>Stay up to date on crypto policy by following @StandWithCrypto on X.</p>
      <Button
        className={cn('max-sm:w-full', linkBoxLinkClassName)}
        data-link-box-subject
        variant="secondary"
      >
        Follow <ArrowUpRight />
      </Button>
    </HeroImage>
  </UserActionFormShareOnTwitterDialog>
)

export function HeroImageWrapper() {
  return (
    <LoginDialogWrapper authenticatedContent={authenticatedContent}>
      {unauthenticatedContent}
    </LoginDialogWrapper>
  )
}
