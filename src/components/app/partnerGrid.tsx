import React from 'react'
import { cva, VariantProps } from 'class-variance-authority'

import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'

const partners = [
  {
    title: 'Paradigm',
    imageSrc: '/partners/paradigm.png',
    url: 'https://www.paradigm.xyz/',
    highlighted: true,
  },
  {
    title: 'Coinbase',
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
    title: 'Lightspark',
    imageSrc: '/partners/lightspark.png',
    url: 'https://www.lightspark.com/',
    highlighted: true,
  },
  { title: 'Paxos', imageSrc: '/partners/paxos.png', url: 'https://paxos.com/', highlighted: true },
  {
    title: 'DoTheySupportIt',
    imageSrc: '/partners/dtsi.png',
    url: 'https://www.dotheysupportit.com/',
  },
  {
    title: 'Privy',
    imageSrc: '/partners/privy_coral.png',
    url: 'https://www.privy.io/',
  },
  {
    title: 'Gemini',
    imageSrc: '/partners/gemini.svg',
    url: 'https://www.gemini.com/',
  },
  {
    title: 'dYdX',
    imageSrc: '/partners/dydx.png',
    url: 'https://dydx.exchange/',
  },
  {
    title: 'Anchorage Digital',
    imageSrc: '/partners/anchorage.png',
    url: 'https://www.anchorage.com/',
  },
  {
    title: 'Blockchain.com',
    imageSrc: '/partners/blockchaindotcom.png',
    url: 'https://www.blockchain.com/',
  },
  {
    title: 'Haun Ventures',
    imageSrc: '/partners/haun.png',
    url: 'https://www.haun.co/',
  },
  {
    title: 'Electric Capital',
    imageSrc: '/partners/electric_capital.png',
    url: 'https://www.electriccapital.com/',
  },
]

const containerVariants = cva('flex items-center relative', {
  variants: {
    variant: {
      default: 'w-44 h-20',
      contained:
        'bg-secondary h-40 w-40 sm:h-56 sm:w-56 rounded-lg border-secondary border-[12px] sm:border-[36px]',
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

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-8">
      {visiblePartners.map(({ title, url, imageSrc }) => {
        const img = (
          <div className={containerVariants({ variant })}>
            <NextImage
              alt={`${title} logo`}
              className="object-contain"
              fill
              priority
              quality={100}
              sizes={'(max-width: 768px) 160px, 224px'}
              src={imageSrc}
            />
          </div>
        )
        return disableLinks ? (
          <React.Fragment key={title}>{img}</React.Fragment>
        ) : (
          <ExternalLink href={url} key={title}>
            {img}
          </ExternalLink>
        )
      })}
    </div>
  )
}
