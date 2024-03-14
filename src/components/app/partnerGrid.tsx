import { cva, VariantProps } from 'class-variance-authority'

import { NextImage } from '@/components/ui/image'

const partners = [
  { title: 'paradigm', imageSrc: '/partners/paradigm.png', highlighted: true },
  { title: 'coinbase', imageSrc: '/partners/coinbase.png', highlighted: true },
  { title: 'lightspark', imageSrc: '/partners/lightspark.png', highlighted: true },
  { title: 'thirdweb', imageSrc: '/partners/thirdweb.png', highlighted: true },
  { title: 'paxos', imageSrc: '/partners/paxos.png', highlighted: true },
]

const containerVariants = cva('flex items-center relative', {
  variants: {
    variant: {
      default: 'w-44 h-20',
      contained: 'bg-secondary h-32 w-32 rounded-lg border-secondary border-[12px]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface PartnerGridProps extends VariantProps<typeof containerVariants> {
  highlightedOnly?: boolean
}

export function PartnerGrid({ highlightedOnly, variant }: PartnerGridProps) {
  const visiblePartners = highlightedOnly
    ? partners.filter(partner => partner.highlighted)
    : partners

  return (
    <div className="flex flex-wrap justify-center gap-8">
      {visiblePartners.map(({ title, imageSrc }) => (
        <div className={containerVariants({ variant })} key={title}>
          <NextImage alt={`${title} logo`} className="object-contain" fill src={imageSrc} />
        </div>
      ))}
    </div>
  )
}
