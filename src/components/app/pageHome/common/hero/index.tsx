import React from 'react'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

import { HeroCTA } from './heroCTA'

export { HeroAnnouncementCard } from './heroAnnouncementCard'

export function Hero({ children }: React.PropsWithChildren) {
  return (
    <section className="grid-fl lg:standard-spacing-from-navbar mb-6 grid grid-cols-1 items-center gap-4 lg:container lg:grid-cols-5 lg:gap-8 lg:gap-y-1">
      {children}
    </section>
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
    <PageSubTitle className="lg:max-w-xl lg:text-left" withoutBalancer>
      {children}
    </PageSubTitle>
  )
}
Hero.Subtitle = HeroSubtitle

Hero.HeadingCTA = HeroCTA
