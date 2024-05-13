import React, { ReactElement } from 'react'

import { ContentSection } from '@/components/app/ContentSection'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { Button } from '@/components/ui/button'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'

export function DTSIPersonHeroCardSection({
  title,
  cta,
  subtitle,
  people,
  locale,
  recommend = true,
}: {
  locale: SupportedLocale
  title: React.ReactNode
  subtitle?: React.ReactNode
  cta: ReactElement
  people: Array<DTSI_PersonCardFragment & { isIncumbent?: boolean }>
  recommend?: boolean
}) {
  const { recommended, others } = recommend
    ? findRecommendedCandidate(people)
    : { recommended: undefined, others: people }
  return (
    <ContentSection {...{ title, subtitle }}>
      <DTSIPersonHeroCardRow>
        {recommended && (
          <DTSIPersonHeroCard isRecommended locale={locale} person={recommended} subheader="role" />
        )}
        {others.map(person => (
          <DTSIPersonHeroCard
            key={person.id}
            locale={locale}
            person={person}
            subheader={person.isIncumbent ? 'Incumbent' : 'role'}
          />
        ))}
      </DTSIPersonHeroCardRow>
      <div className="container mt-8 text-center xl:mt-14">
        <Button asChild className="max-sm:w-full">
          {cta}
        </Button>
      </div>
    </ContentSection>
  )
}
