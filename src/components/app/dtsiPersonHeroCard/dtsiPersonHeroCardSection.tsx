import React, { ReactNode } from 'react'

import { ContentSection } from '@/components/app/ContentSection'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { Button } from '@/components/ui/button'
import { PageTitleProps } from '@/components/ui/pageTitleText'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'

export interface DTSIPersonHeroCardSectionProps {
  locale: SupportedLocale
  title: React.ReactNode
  titleProps?: PageTitleProps
  subtitle?: React.ReactNode
  cta?: ReactNode
  people: Array<DTSI_PersonCardFragment & { isIncumbent?: boolean }>
  recommend?: boolean
  forceMobile?: boolean
  target?: React.HTMLAttributeAnchorTarget
}

export function DTSIPersonHeroCardSection({
  title,
  titleProps = {},
  cta,
  subtitle,
  people,
  locale,
  recommend = true,
  forceMobile = false,
  target,
}: DTSIPersonHeroCardSectionProps) {
  const { recommended, others } = recommend
    ? findRecommendedCandidate(people)
    : { recommended: undefined, others: people }
  return (
    <ContentSection {...{ title, subtitle, titleProps }}>
      <DTSIPersonHeroCardRow forceMobile={forceMobile}>
        {recommended && (
          <DTSIPersonHeroCard
            forceMobile={forceMobile}
            isRecommended
            locale={locale}
            person={recommended}
            subheader="role"
            target={target}
          />
        )}
        {others.map(person => (
          <DTSIPersonHeroCard
            forceMobile={forceMobile}
            key={person.id}
            locale={locale}
            person={person}
            subheader={person.isIncumbent ? 'Incumbent' : 'role'}
            target={target}
          />
        ))}
      </DTSIPersonHeroCardRow>
      {cta && (
        <div className="container mt-8 text-center xl:mt-14">
          <Button asChild className="max-sm:w-full">
            {cta}
          </Button>
        </div>
      )}
    </ContentSection>
  )
}
