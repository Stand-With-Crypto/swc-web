'use client'

import React from 'react'
import { noop } from 'lodash-es'

import { PetitionMilestones } from '@/components/app/pagePetitionDetails/milestones'
import { SignatoriesCarousel } from '@/components/app/pagePetitionDetails/signatoriesCarousel'
import { SignaturesSummary } from '@/components/app/pagePetitionDetails/summary'
import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { StyledHtmlContent } from '@/components/ui/styledHtmlContent'
import { PetitionData } from '@/types/petition'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface PagePetitionDetailsProps {
  petition: PetitionData
  countryCode: SupportedCountryCodes
  recentSignatures: Array<{
    locale: string
    datetimeSigned: string
  }>
  isSigned?: boolean
}

const TOP_SECTION_HEIGHT_CLASS_NAME = 'h-[440px]'
const PETITION_ICON_SIZE = 280
const FALLBACK_PETITION_ICON_PATH = '/activityFeedIcons/petition.svg'

export function PagePetitionDetails({
  petition,
  countryCode,
  recentSignatures,
  isSigned = false,
}: PagePetitionDetailsProps) {
  const locale = COUNTRY_CODE_TO_LOCALE[countryCode]
  const isClosed = !!petition.datetimeFinished
  const _hasReachedGoal = petition.signaturesCount >= petition.countSignaturesGoal

  // Generate petition closing date text
  const closingDateText = petition.datetimeFinished
    ? `Petition closed ${new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(petition.datetimeFinished)}`
    : `Petition closes Sep 29, 2025` // Mock closing date from the visual reference

  return (
    <div className="standard-spacing-from-navbar container mx-auto max-w-6xl">
      <section className="mb-16 space-y-6 text-center lg:text-left">
        <PageTitle className="text-4xl font-bold lg:text-5xl">{petition.title}</PageTitle>
        <PageSubTitle className="text-lg text-muted-foreground">{closingDateText}</PageSubTitle>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
        <div className="space-y-10 lg:col-span-4">
          <section
            className={cn('relative w-full overflow-hidden rounded-3xl', 'h-48 lg:h-[440px]')}
          >
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
                  src={FALLBACK_PETITION_ICON_PATH}
                  width={PETITION_ICON_SIZE}
                />
              </div>
            )}
          </section>

          {/* Mobile: Summary after image */}
          <div className="sticky top-20 z-10 !mt-2 lg:hidden">
            {/* The bang on margin-top is because of the space-y on the parent component */}
            <SignaturesSummary
              className="border bg-muted/90 shadow-sm backdrop-blur-md"
              goal={petition.countSignaturesGoal}
              isClosed={isClosed}
              isSigned={isSigned}
              locale={locale}
              onSign={noop}
              petitionSlug={petition.slug}
              signatures={petition.signaturesCount}
            />
          </div>

          <section>
            <h3 className="mb-4 text-xl font-semibold">Recent signers</h3>
            <SignatoriesCarousel countryCode={countryCode} lastSignatures={recentSignatures} />
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Info</h2>
            <StyledHtmlContent className="[&_*]:text-fontcolor-muted" html={petition.content} />
          </section>

          <section>
            <PetitionMilestones
              additionalMilestones={
                petition.milestones?.map(milestone => ({
                  label: milestone.title,
                  isComplete: true,
                })) || []
              }
              currentSignatures={petition.signaturesCount}
              goal={petition.countSignaturesGoal}
              locale={locale}
              shouldGenerateAutomaticMilestones={petition.enableAutomaticMilestones}
            />
          </section>
        </div>

        {/* Desktop: Summary in right column */}
        <div className="hidden lg:col-span-2 lg:block">
          <div className="sticky top-24">
            <SignaturesSummary
              className={TOP_SECTION_HEIGHT_CLASS_NAME}
              goal={petition.countSignaturesGoal}
              isClosed={isClosed}
              isSigned={isSigned}
              locale={locale}
              onSign={noop}
              petitionSlug={petition.slug}
              signatures={petition.signaturesCount}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
