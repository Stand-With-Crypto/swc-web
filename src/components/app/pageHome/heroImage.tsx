import { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import NextLink from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { Button } from '@/components/ui/button'
import { HowToVoteIcon } from '@/components/ui/icons/howToVote'
import { LiveTVIcon } from '@/components/ui/icons/liveTv'
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
}

const HeroImage = ({ children, className, fallback }: HeroImageProps) => {
  return (
    <LinkBox className="relative h-[320px] overflow-hidden md:rounded-xl lg:h-[400px]">
      <Video
        className={cn('absolute left-0 top-0 h-full w-full object-cover')}
        fallback={fallback}
        poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP0dpm3AgAD5gHXYQBQLgAAAABJRU5ErkJggg=="
        src="https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4"
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
  <UserActionFormEmailCongresspersonDialog>
    <HeroImage
      className="flex-col sm:flex-row"
      fallback={
        <NextImage
          alt="Email your rep"
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
      <p>
        FIT21 is a bipartisan crypto bill being considered for a vote in Congress. Ask your Rep to
        support its clear, commonsense rules for crypto today.
      </p>
      <Button
        className={cn('max-sm:w-full', linkBoxLinkClassName)}
        data-link-box-subject
        variant="secondary"
      >
        Email your Rep <ArrowUpRight />
      </Button>
    </HeroImage>
  </UserActionFormEmailCongresspersonDialog>
)

export function HeroImageWrapper() {
  return (
    <LoginDialogWrapper authenticatedContent={authenticatedContent}>
      {unauthenticatedContent}
    </LoginDialogWrapper>
  )
}

export function CNNDebateHeroImage() {
  return (
    <NextLink href="/events/cnn-debate">
      <LinkBox className="relative h-[320px] overflow-hidden md:rounded-xl lg:h-[400px]">
        <div
          className="h-full w-full"
          style={{
            background: 'radial-gradient(69.92% 69.92% at 50% 48.88%, #8E49FF 0%, #6100FF 100%)',
          }}
        >
          <div className="flex flex-col gap-4 p-10">
            <div className="flex gap-2">
              <LiveTVIcon />
              <HowToVoteIcon />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-sans text-4xl font-bold leading-normal text-background">
                CRYPTO VOTES
              </p>
              <p className="text-2xl font-normal leading-normal text-background">
                Debate watch party
              </p>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 flex w-full items-center justify-between gap-4 p-4 text-sm text-white"
          style={{
            background:
              'linear-gradient(to top, hsla(0, 0%, 0%, 0.8) 10%, hsla(0, 0%, 0%, 0.4) 70%,  transparent 100%)',
          }}
        >
          <p>Find a debate watch party near you</p>
          <Button className={linkBoxLinkClassName} data-link-box-subject variant="secondary">
            View events
            <ArrowUpRight />
          </Button>
        </div>
      </LinkBox>
    </NextLink>
  )
}
