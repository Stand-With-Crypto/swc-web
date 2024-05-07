import { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { cn } from '@/utils/web/cn'

interface HeroImageProps {
  children: ReactNode
  className?: string
}

const HeroImage = ({ children, className }: HeroImageProps) => {
  return (
    <LinkBox className="relative h-[320px] overflow-hidden md:rounded-xl lg:h-[400px]">
      <NextImage
        alt="sign up"
        className="h-full w-full object-cover"
        fill
        priority
        sizes={'(max-width: 400px) 375px, 500px'}
        src="/homepageHero.gif"
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
  <HeroImage>
    <p>Join Stand With Crypto and help us defend your right to own crypto in America.</p>
    <Button className={linkBoxLinkClassName} data-link-box-subject variant="secondary">
      Join
      <ArrowUpRight />
    </Button>
  </HeroImage>
)

const authenticatedContent = (
  <UserActionFormEmailCongresspersonDialog>
    <HeroImage className="flex-col sm:flex-row">
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
