import React from 'react'
import { cva, VariantProps } from 'class-variance-authority'

import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'

const partners = [
  {
    title: 'paradigm',
    imageSrc: '/partners/paradigm.png',
    url: 'https://www.paradigm.xyz/',
    highlighted: true,
  },
  {
    title: 'coinbase',
    imageSrc: '/partners/coinbase.png',
    url: 'https://www.coinbase.com/',
    highlighted: true,
  },
  {
    title: 'thirdweb',
    imageSrc: '/partners/thirdweb.png',
    url: 'https://thirdweb.com/',
    highlighted: true,
  },
  {
    title: 'lightspark',
    imageSrc: '/partners/lightspark.png',
    url: 'https://www.lightspark.com/',
    highlighted: true,
  },
  { title: 'paxos', imageSrc: '/partners/paxos.png', url: 'https://paxos.com/', highlighted: true },
  {
    title: 'dtsi',
    imageSrc: '/partners/dtsi.png',
    url: 'https://www.dotheysupportit.com/',
    highlighted: false,
  },
]

const containerVariants = cva('flex items-center relative', {
  variants: {
    variant: {
      default: 'w-44 h-20',
      contained: 'bg-secondary h-56 w-56 rounded-lg border-secondary border-[36px]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface PartnerGridProps extends VariantProps<typeof containerVariants> {
  highlightedOnly?: boolean
  disableLinks?: boolean
}

export function PartnerGrid({ highlightedOnly, disableLinks, variant }: PartnerGridProps) {
  const visiblePartners = highlightedOnly
    ? partners.filter(partner => partner.highlighted)
    : partners

  const Container = disableLinks ? React.Fragment : ExternalLink
  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-8">
      {visiblePartners.map(({ title, url, imageSrc }) => (
        <Container href={url} key={title}>
          <div className={containerVariants({ variant })}>
            <NextImage
              alt={`${title} logo`}
              className="object-contain"
              fill
              priority
              src={imageSrc}
            />
          </div>
        </Container>
      ))}
    </div>
  )
}
