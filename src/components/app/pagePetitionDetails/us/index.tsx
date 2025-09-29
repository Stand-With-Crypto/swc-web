import React, { useMemo } from 'react'

import * as PetitionDetailsBody from '@/components/app/pagePetitionDetails/common/body'
import * as PetitionDetailsHeader from '@/components/app/pagePetitionDetails/common/header'
import { PetitionDetailsImageBanner } from '@/components/app/pagePetitionDetails/common/imageBanner'
import { PetitionDetailsInfo } from '@/components/app/pagePetitionDetails/common/info'
import { PetitionMilestones } from '@/components/app/pagePetitionDetails/common/milestones'
import { SignatoriesCarouselSection } from '@/components/app/pagePetitionDetails/common/signatoriesCarousel/section'
import { SignatureProvider } from '@/components/app/pagePetitionDetails/common/signatureContext'
import { SignaturesSummary } from '@/components/app/pagePetitionDetails/common/summary'
import { PetitionMobileGradient } from '@/components/app/pagePetitionDetails/common/summary/mobileGradient'
import { PetitionMobileSummaryWrapper } from '@/components/app/pagePetitionDetails/common/summary/mobileWrapper'
import { PetitionDetailsWrapper } from '@/components/app/pagePetitionDetails/common/wrapper'
import { UsPagePetitionDetailsWithDebugger } from '@/components/app/pagePetitionDetails/us/pagePetitionDetailsWithDebugger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

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

const isStaging = NEXT_PUBLIC_ENVIRONMENT !== 'production'

export function UsPagePetitionDetails({
  petition,
  countryCode,
  recentSignatures,
}: PagePetitionDetailsProps) {
  if (isStaging) {
    return (
      <UsPagePetitionDetailsWithDebugger
        countryCode={countryCode}
        petition={petition}
        recentSignatures={recentSignatures}
      />
    )
  }

  return (
    <UsPagePetitionDetailsContent
      countryCode={countryCode}
      petition={petition}
      recentSignatures={recentSignatures}
    />
  )
}

export function UsPagePetitionDetailsContent({
  petition,
  countryCode,
  recentSignatures,
}: PagePetitionDetailsContentProps) {
  const locale = COUNTRY_CODE_TO_LOCALE[countryCode]
  const isClosed = petition.datetimeFinished
    ? new Date(petition.datetimeFinished) < new Date()
    : false

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
    <SignatureProvider actualSignatureCount={petition.signaturesCount} petitionSlug={petition.slug}>
      <PetitionDetailsWrapper>
        <PetitionDetailsHeader.Root>
          <PetitionDetailsHeader.Title>{petition.title}</PetitionDetailsHeader.Title>
          {petition.datetimeFinished && (
            <PetitionDetailsHeader.Subtitle>{closingDateText}</PetitionDetailsHeader.Subtitle>
          )}
        </PetitionDetailsHeader.Root>

        <PetitionDetailsBody.Root>
          <PetitionDetailsBody.Main>
            <PetitionDetailsImageBanner petition={petition} />

            {/* Mobile: Summary after image */}
            <PetitionMobileSummaryWrapper>
              {/* The bang on margin-top is because of the space-y on the parent component */}
              <SignaturesSummary
                countryCode={countryCode}
                goal={petition.countSignaturesGoal}
                isClosed={isClosed}
                locale={locale}
                petitionSlug={petition.slug}
              />
              <PetitionMobileGradient />
            </PetitionMobileSummaryWrapper>

            {isClosed && recentSignatures.length === 0 ? null : (
              <SignatoriesCarouselSection
                countryCode={countryCode}
                recentSignatures={recentSignatures}
              />
            )}

            <PetitionDetailsInfo content={petition.content} />

            <section>
              <PetitionMilestones
                additionalMilestones={
                  petition.milestones?.map(milestone => ({
                    label: milestone.title,
                    isComplete: true,
                  })) || []
                }
                goal={petition.countSignaturesGoal}
                locale={locale}
                shouldGenerateAutomaticMilestones={!!petition.enableAutomaticMilestones}
              />
            </section>
          </PetitionDetailsBody.Main>

          {/* Desktop: Summary in right column */}
          <PetitionDetailsBody.Aside>
            <SignaturesSummary
              className="h-[440px]"
              countryCode={countryCode}
              goal={petition.countSignaturesGoal}
              isClosed={isClosed}
              locale={locale}
              petitionSlug={petition.slug}
            />
          </PetitionDetailsBody.Aside>
        </PetitionDetailsBody.Root>
      </PetitionDetailsWrapper>
    </SignatureProvider>
  )
}
