import React, { useMemo } from 'react'

import { PetitionMilestones } from '@/components/app/pagePetitionDetails/milestones'
import { PagePetitionDetailsWithDebugger } from '@/components/app/pagePetitionDetails/pagePetitionDetailsWithDebugger'
import { SignatoriesCarousel } from '@/components/app/pagePetitionDetails/signatoriesCarousel'
import { SignaturesSummary } from '@/components/app/pagePetitionDetails/summary'
import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { StyledHtmlContent } from '@/components/ui/styledHtmlContent'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { cn } from '@/utils/web/cn'

interface PagePetitionDetailsProps {
  petition: SWCPetition
  countryCode: SupportedCountryCodes
  recentSignatures: Array<{
    locale: string
    datetimeSigned: string
  }>
}

interface PagePetitionDetailsContentProps {
  petition: SWCPetition
  countryCode: SupportedCountryCodes
  recentSignatures: Array<{
    locale: string
    datetimeSigned: string
  }>
}

const PETITION_ICON_SIZE = 280
const isProd = NEXT_PUBLIC_ENVIRONMENT === 'production'

export function PagePetitionDetails({
  petition,
  countryCode,
  recentSignatures,
}: PagePetitionDetailsProps) {
  if (isProd) {
    return (
      <PagePetitionDetailsContent
        countryCode={countryCode}
        petition={petition}
        recentSignatures={recentSignatures}
      />
    )
  }

  return (
    <PagePetitionDetailsWithDebugger
      countryCode={countryCode}
      petition={petition}
      recentSignatures={recentSignatures}
    />
  )
}

export function PagePetitionDetailsContent({
  petition,
  countryCode,
  recentSignatures,
}: PagePetitionDetailsContentProps) {
  const locale = COUNTRY_CODE_TO_LOCALE[countryCode]
  const isClosed = petition.datetimeFinished
    ? new Date(petition.datetimeFinished) < new Date()
    : false

  // Generate petition closing date text
  const closingDateText = useMemo(() => {
    if (petition.datetimeFinished) {
      const formattedDate = new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(petition.datetimeFinished))

      if (isClosed) return `Petition closed ${formattedDate}`
      return `Petition closes on ${formattedDate}`
    }

    return null
  }, [petition.datetimeFinished, locale, isClosed])

  return (
    <div className="standard-spacing-from-navbar container mx-auto max-w-6xl">
      <section className="mb-16 space-y-6 text-center lg:text-left">
        <PageTitle className="text-4xl font-bold lg:text-5xl">{petition.title}</PageTitle>
        {petition.datetimeFinished && (
          <PageSubTitle className="text-lg text-muted-foreground">{closingDateText}</PageSubTitle>
        )}
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
                  src="/actionTypeIcons/petition.svg"
                  width={PETITION_ICON_SIZE}
                />
              </div>
            )}
          </section>

          {/* Mobile: Summary after image */}
          <div className="sticky top-[70px] z-10 !mt-2 bg-background pb-0 pt-2 lg:hidden">
            {/* The bang on margin-top is because of the space-y on the parent component */}
            <SignaturesSummary
              countryCode={countryCode}
              goal={petition.countSignaturesGoal}
              isClosed={isClosed}
              locale={locale}
              petitionSlug={petition.slug}
              signatures={110000}
            />
            {/* This is to add a gradient to make smoother the scroll effect */}
            <div className="to-red absolute -bottom-10 left-0 right-0 -z-10 h-12 bg-gradient-to-b from-background to-transparent"></div>
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
              shouldGenerateAutomaticMilestones={!!petition.enableAutomaticMilestones}
            />
          </section>
        </div>

        {/* Desktop: Summary in right column */}
        <div className="hidden lg:col-span-2 lg:block">
          <div className="sticky top-24">
            <SignaturesSummary
              className="h-[440px]"
              countryCode={countryCode}
              goal={petition.countSignaturesGoal}
              isClosed={isClosed}
              locale={locale}
              petitionSlug={petition.slug}
              signatures={109999}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
