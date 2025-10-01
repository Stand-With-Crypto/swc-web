'use client'

import { useMemo } from 'react'

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
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface PagePetitionDetailsContentProps {
  petition: SWCPetition
  countryCode: SupportedCountryCodes
  language: SupportedLanguages
  recentSignatures: Array<{
    locale: string
    datetimeSigned: string
  }>
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      petitionClosed: 'Petition closed {date}',
      petitionClosesOn: 'Petition closes on {date}',
    },
    de: {
      petitionClosed: 'Petition geschlossen am {date}',
      petitionClosesOn: 'Petition schließt am {date}',
    },
    fr: {
      petitionClosed: 'Pétition clôturée le {date}',
      petitionClosesOn: 'La pétition se termine le {date}',
    },
  },
})

export function EuPagePetitionDetailsContent({
  petition,
  countryCode,
  recentSignatures,
}: PagePetitionDetailsContentProps) {
  const { t } = useTranslation(i18nMessages, 'EuPagePetitionDetailsContent')

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

      if (isClosed) return t('petitionClosed', { date: formattedDate })
      return t('petitionClosesOn', { date: formattedDate })
    }

    return null
  }, [petition.datetimeFinished, locale, isClosed, t])

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
              <SignatoriesCarouselSection recentSignatures={recentSignatures} />
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
