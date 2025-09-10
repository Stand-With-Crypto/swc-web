'use client'

import { UserActionType } from '@prisma/client'

import { PetitionCard } from '@/components/app/pagePetitions/card'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { cn } from '@/utils/web/cn'

const PETITIONS_GRID_CLASSNAMES =
  'grid grid-cols-1 gap-4 lg:flex lg:flex-wrap lg:justify-center lg:gap-8'

interface PetitionsContentProps {
  title: string
  description: string
  currentPetitions: SWCPetition[]
  pastPetitions: SWCPetition[]
  countryCode: SupportedCountryCodes
  locale: SupportedLocale
}

export function PetitionsContent({
  title,
  description,
  currentPetitions,
  pastPetitions,
  countryCode,
  locale,
}: PetitionsContentProps) {
  const { data: userData } = useApiResponseForUserFullProfileInfo()

  const renderPetitionCard = (petition: SWCPetition, variant: 'current' | 'past') => {
    const isSigned = userData?.user?.userActions?.some(
      userAction =>
        userAction.actionType === UserActionType.SIGN_PETITION &&
        userAction.campaignName === petition.slug,
    )

    const signaturesCount = isSigned ? petition.signaturesCount + 1 : petition.signaturesCount

    return (
      <PetitionCard
        className="lg:w-80"
        countryCode={countryCode}
        imgSrc={petition.image || undefined}
        isGoalReached={petition.countSignaturesGoal <= petition.signaturesCount}
        isSigned={isSigned}
        key={petition.slug}
        locale={locale}
        signaturesCount={signaturesCount}
        slug={petition.slug}
        title={petition.title}
        variant={variant}
      />
    )
  }

  return (
    <div className="standard-spacing-from-navbar container space-y-20">
      <section className="space-y-7 text-center">
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>
      </section>

      <section>
        <h2 className="mb-6 text-center text-3xl font-bold">
          {currentPetitions.length > 0 ? 'Current Petitions' : 'There are no current petitions'}
        </h2>
        <div className={PETITIONS_GRID_CLASSNAMES}>
          {currentPetitions.map(petition => renderPetitionCard(petition, 'current'))}
        </div>
      </section>

      <section className={cn(pastPetitions.length <= 0 && 'hidden')}>
        <h2 className="mb-6 text-center text-3xl font-bold">Past Petitions</h2>
        <div className={PETITIONS_GRID_CLASSNAMES}>
          {pastPetitions.map(petition => renderPetitionCard(petition, 'past'))}
        </div>
      </section>
    </div>
  )
}
