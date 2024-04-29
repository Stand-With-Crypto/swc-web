'use client'

import { ArrowUpRight } from 'lucide-react'

import { UserActionFormVoterRegistrationDeeplinkWrapper } from '@/components/app/userActionFormVoterRegistration/homepageDialogDeeplinkWrapper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { dialogContentStyles } from '@/components/ui/dialog/styles'
import { NextImage } from '@/components/ui/image'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/utils/web/cn'

const unauthenticatedContent = (
  <p>Join Stand With Crypto and help us defend your right to own crypto in America.</p>
)
const authenticatedContent = (
  <p>
    FIT21 is a bipartisan crypto bill being considered for a vote in Congress. Ask your Rep to
    support its clear, commonsense rules for crypto today.
  </p>
)

export function HeroImage() {
  const { isLoggedIn } = useSession()

  return (
    <Dialog analytics={{ Category: 'Homepage Hero Section', CTA: 'Register to vote' }}>
      <DialogTrigger asChild>
        <LinkBox className="relative h-[320px] overflow-hidden md:rounded-xl lg:h-[400px]">
          <NextImage
            alt="Free NFT given out when you register to vote."
            className="h-full w-full object-cover"
            fill
            priority
            sizes={'500px'}
            src="/homepageHero.gif"
          />
          <div
            className="absolute bottom-0 flex w-full items-center justify-between gap-4 p-4 text-sm text-white"
            style={{
              background:
                'linear-gradient(to top, hsla(0, 0%, 0%, 0.8) 10%, hsla(0, 0%, 0%, 0.4) 70%,  transparent 100%)',
            }}
          >
            {isLoggedIn ? authenticatedContent : unauthenticatedContent}
            <Button className={linkBoxLinkClassName} data-link-box-subject variant="secondary">
              Register <ArrowUpRight />
            </Button>
          </div>
        </LinkBox>
      </DialogTrigger>
      <DialogContent className={cn(dialogContentStyles, 'max-w-3xl')}>
        <UserActionFormVoterRegistrationDeeplinkWrapper />
      </DialogContent>
    </Dialog>
  )
}
