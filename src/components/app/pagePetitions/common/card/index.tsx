'use client'

import { useState } from 'react'
import { PartyPopperIcon } from 'lucide-react'
import Link from 'next/link'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { NextImage } from '@/components/ui/image'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { pluralize } from '@/utils/shared/pluralize'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { cn } from '@/utils/web/cn'
import { useLanguage } from '@/utils/web/i18n/useLanguage'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface PetitionCardProps {
  petition: SWCPetition
  countryCode: SupportedCountryCodes
  locale?: SupportedLocale
  className?: string
  variant?: 'current' | 'past'
  isSigned?: boolean
}

const IMAGE_SIZE = 150 // in pixels (150x150)
const FALLBACK_IMAGE_PATH = '/actionTypeIcons/petition.svg'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      petition: 'Petition',
      signature: 'signature',
      signatures: 'signatures',
      signed: 'Signed',
      goalReached: 'Goal reached!',
    },
    de: {
      petition: 'Petition',
      signature: 'Unterschrift',
      signatures: 'Unterschriften',
      signed: 'Unterschrieben',
      goalReached: 'Ziel erreicht!',
    },
    fr: {
      petition: 'Pétition',
      signature: 'signature',
      signatures: 'signatures',
      signed: 'Signé',
      goalReached: 'Objectif atteint !',
    },
  },
})

export function PetitionCard({
  petition,
  countryCode,
  locale = SupportedLocale.EN_US,
  className,
  variant = 'current',
  isSigned = false,
}: PetitionCardProps) {
  const { t } = useTranslation(i18nMessages, 'PetitionCard')
  const [imageError, setImageError] = useState(false)
  const showImage = petition.image && !imageError
  const language = useLanguage()

  const urls = getIntlUrls(countryCode, { language })

  const isPast = variant === 'past'
  const isCurrent = variant === 'current'

  const isGoalReached = petition.countSignaturesGoal <= petition.signaturesCount
  const signaturesCount = isSigned ? petition.signaturesCount + 1 : petition.signaturesCount

  return (
    <Link
      className={cn(
        'block cursor-pointer overflow-hidden rounded-3xl bg-white shadow-md transition-shadow hover:shadow-xl',
        'grid w-full border-t border-gray-100 lg:w-80',
        'lg:grid-rows-[224px_1fr]',
        isPast ? 'max-lg:grid-cols-[1fr_128px]' : 'max-lg:grid-rows-[224px_1fr]',
        className,
      )}
      href={urls.petitionDetails(petition.slug)}
    >
      <div
        className={cn('relative lg:h-auto', {
          'max-lg:order-2': isPast,
        })}
      >
        {showImage && petition.image ? (
          <NextImage
            alt={petition.title}
            className="h-full w-full object-cover"
            fill
            onError={() => setImageError(true)}
            src={petition.image}
          />
        ) : (
          <div className="bg-circular-gradient flex h-full w-full items-center justify-center px-5 py-9">
            <NextImage
              alt={t('petition')}
              height={IMAGE_SIZE}
              src={FALLBACK_IMAGE_PATH}
              width={IMAGE_SIZE}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div
          className={cn('flex flex-col gap-4 p-4 max-lg:gap-3 lg:p-6', {
            'p-6': isCurrent,
          })}
        >
          <h3 className="line-clamp-4 min-h-[72px] text-xl font-bold leading-tight text-foreground max-lg:text-base lg:line-clamp-3">
            {petition.title}
          </h3>
        </div>
        <div
          className={cn(
            'text-md mt-auto flex justify-between border-muted p-4 font-medium text-foreground lg:border-t lg:p-6',
            { 'border-t p-6': isCurrent },
          )}
        >
          <p className="flex items-center lg:h-8">
            {isGoalReached ? (
              <span className="flex items-center gap-2">
                <PartyPopperIcon />
                {t('goalReached')}
              </span>
            ) : (
              <>
                <FormattedNumber amount={signaturesCount} locale={locale} />{' '}
                {pluralize({
                  count: signaturesCount,
                  singular: t('signature'),
                  plural: t('signatures'),
                })}
              </>
            )}
          </p>
          {isSigned && <CheckIcon completed />}
        </div>
      </div>
    </Link>
  )
}
