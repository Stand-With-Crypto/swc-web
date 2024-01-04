import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'
import { ReactNode } from 'react'

import { cardClassNames } from './styles'

interface CardGroupProps {
  sections: {
    label: string
    value: ReactNode
    imageSrc?: string
    imageAlt?: string
  }[]
}

export function CardGroup({ sections }: CardGroupProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {sections.map(section => (
        <div
          key={section.label}
          className={cn('flex min-w-[148px] flex-1 flex-col gap-4', cardClassNames)}
        >
          <div className="flex justify-between gap-4">
            <PageTitle as="p">{section.value}</PageTitle>
            {section.imageSrc && section.imageAlt && (
              <div className="relative h-10 w-10 md:h-12 md:w-12 lg:h-16 lg:w-16">
                <NextImage alt={section.imageAlt} src={section.imageSrc} fill />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 lg:text-base">{section.label}</p>
        </div>
      ))}
    </div>
  )
}
