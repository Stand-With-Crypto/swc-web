import { NextImage } from '@/components/ui/image'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { cn } from '@/utils/web/cn'

interface PetitionDetailsImageBannerProps {
  petition: SWCPetition
}

const PETITION_ICON_SIZE = 280

export function PetitionDetailsImageBanner({ petition }: PetitionDetailsImageBannerProps) {
  return (
    <section className={cn('relative w-full overflow-hidden rounded-3xl', 'h-48 lg:h-[440px]')}>
      {petition.image ? (
        <NextImage
          alt={petition.title}
          className="h-full w-full object-cover"
          fill
          src={petition.image}
        />
      ) : (
        <div className="bg-circular-gradient flex h-full w-full items-center justify-center px-5 py-9">
          <NextImage
            alt="Petition"
            className="h-32 w-32 lg:h-64 lg:w-64"
            height={PETITION_ICON_SIZE}
            src="/actionTypeIcons/petition.svg"
            width={PETITION_ICON_SIZE}
          />
        </div>
      )}
    </section>
  )
}
