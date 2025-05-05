import { NextImage } from '@/components/ui/image'

interface Props {
  imageUrl: string
  title: string
  subtitle: string
  href?: string
}

export function ResourcesCards({ imageUrl, title, subtitle, href }: Props) {
  const Slot = href ? 'a' : 'div'
  return (
    <Slot className="flex flex-col gap-4" data-test-id="resources-card" href={href} target="_blank">
      <NextImage
        alt={title}
        className="aspect-[450/240] object-cover"
        height={240}
        objectFit="cover"
        priority
        quality={100}
        src={imageUrl}
        width={450}
      />
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-bold leading-normal">{title}</h3>
        <p className="text-base font-normal leading-normal text-muted-foreground">{subtitle}</p>
      </div>
    </Slot>
  )
}
