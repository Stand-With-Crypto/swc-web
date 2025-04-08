import React from 'react'
import Balancer from 'react-wrap-balancer'

import { InternalLink } from '@/components/ui/link'
import { PageTitle, PageTitleProps } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

export function DarkHeroSection({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={cn('relative bg-black px-4 py-24 text-center text-white antialiased', className)}
    >
      {children}
    </section>
  )
}

function DarkHeroSectionBreadcrumbs({ sections }: { sections: { name: string; url?: string }[] }) {
  return (
    <div className={'mb-4'}>
      {sections.map(({ name, url }, index) => (
        <span key={name}>
          {url ? (
            <InternalLink className="text-gray-400" href={url}>
              {name}
            </InternalLink>
          ) : (
            name
          )}
          {index < sections.length - 1 && <> / </>}
        </span>
      ))}
    </div>
  )
}
DarkHeroSection.Breadcrumbs = DarkHeroSectionBreadcrumbs

function DarkHeroSectionTitle(props: React.PropsWithChildren<PageTitleProps>) {
  return <PageTitle as="h1" size="md" {...props} />
}
DarkHeroSection.Title = DarkHeroSectionTitle

function DarkHeroSectionSubtitle({
  children,
  className,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h2 className={cn('mt-6 space-y-4 font-light text-muted lg:space-y-1', className)} {...props}>
      <Balancer>{children}</Balancer>
    </h2>
  )
}
DarkHeroSection.Subtitle = DarkHeroSectionSubtitle

function HighlightedText({ children }: React.PropsWithChildren) {
  return <h3 className="mt-6 text-xl font-bold">{children}</h3>
}
DarkHeroSection.HighlightedText = HighlightedText
