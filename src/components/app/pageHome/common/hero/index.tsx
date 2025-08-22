import React from 'react'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

import { HeroCTA } from './heroCTA'

export { HeroAnnouncementCard } from './heroAnnouncementCard'

const commonBlurBackgroundClass = 'hidden md:block bg-purple-light top-0 absolute blur-[60px]'

export function Hero({ children }: React.PropsWithChildren) {
  return (
    <div className="relative overflow-hidden">
      <div className={cn(commonBlurBackgroundClass, 'left-0 h-52 w-[512px] translate-y-[-50%]')} />
      <div
        className={cn(
          commonBlurBackgroundClass,
          'right-0 top-2 h-[512px] w-52 translate-x-[50%] rotate-12',
        )}
      />
      <div className="grid-fl lg:standard-spacing-from-navbar relative z-10 mb-6 grid grid-cols-1 items-center gap-4 lg:container md:mb-14 md:mt-28 lg:grid-cols-5 lg:gap-8 lg:gap-y-1">
        {children}
      </div>
    </div>
  )
}

function HeroHeading({ children }: React.PropsWithChildren) {
  return (
    <div className="lg:order-0 container order-1 mx-auto max-w-xl space-y-6 pt-4 text-center md:max-w-3xl lg:col-span-3 lg:px-0 lg:pt-0 lg:text-left">
      {children}
    </div>
  )
}
Hero.Heading = HeroHeading

function HeroTitle({ children }: React.PropsWithChildren) {
  return (
    <PageTitle className="lg:text-left" withoutBalancer>
      {children}
    </PageTitle>
  )
}
Hero.Title = HeroTitle

function HeroSubtitle({ children }: React.PropsWithChildren) {
  return (
    <PageSubTitle className="lg:max-w-xl lg:text-left lg:text-justify" withoutBalancer>
      {children}
    </PageSubTitle>
  )
}
Hero.Subtitle = HeroSubtitle

Hero.HeadingCTA = HeroCTA
