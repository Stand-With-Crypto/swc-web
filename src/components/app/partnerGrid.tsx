import { NextImage } from '@/components/ui/image'

const partners = [
  { title: 'Coinbase', imageSrc: '/pagesContent/contribute/coinbase.png' },
  // { title: 'Boost', imageSrc: '/pagesContent/contribute/boost.png' },
  { title: 'thirdweb', imageSrc: '/pagesContent/contribute/thirdweb.png' },
]

const placeholderPartner = { title: 'Your Logo', imageSrc: '/pagesContent/contribute/yourlogo.svg' }

const partnersWithPlaceholders = Array.from(
  { length: 12 },
  (_, index) => partners[index] || placeholderPartner,
)

export function PartnerGrid() {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
      {partnersWithPlaceholders.map(({ title, imageSrc }, index) => (
        <NextImage
          alt={`${title} logo`}
          className="h-24 w-24 lg:h-28 lg:w-28"
          height={164}
          key={`${title}-${index}`}
          src={imageSrc}
          width={164}
        />
      ))}
    </div>
  )
}
