import React, { ReactNode } from 'react'

import { ContentSection } from '@/components/app/ContentSection'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { Button } from '@/components/ui/button'
import { PageTitleProps } from '@/components/ui/pageTitleText'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface DTSIPersonHeroCardSectionProps {
  countryCode: SupportedCountryCodes
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
  countryCode,
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
            countryCode={countryCode}
            cryptoStanceGrade={DTSIFormattedLetterGrade}
            forceMobile={forceMobile}
            isRecommended
            person={recommended}
            subheader="role"
            target={target}
          />
        )}
        {others.map(person => (
          <DTSIPersonHeroCard
            countryCode={countryCode}
            cryptoStanceGrade={DTSIFormattedLetterGrade}
            forceMobile={forceMobile}
            key={person.id}
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
