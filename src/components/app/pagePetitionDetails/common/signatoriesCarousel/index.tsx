'use client'

import React, { useMemo } from 'react'
import { Edit3 } from 'lucide-react'

import { useSignature } from '@/components/app/pagePetitionDetails/common/signatureContext'
import * as BadgesAutomaticCarousel from '@/components/ui/badgesAutomaticCarousel'
import { FormattedRelativeDatetime } from '@/components/ui/formattedRelativeDatetime'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

type LastSignature =
  | {
      locale: string
      datetimeSigned: string
      isUserSignature?: false
    }
  | {
      isUserSignature: true
      datetimeSigned: string
    }

interface SignatoriesCarouselProps {
  autoplayDelay?: number
  className?: string
  lastSignatures: LastSignature[]
}

const MIN_SIGNATURES_TO_RENDER_LIST = 1

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      youSigned: 'You signed',
      beTheFirstToSign: 'Be the first to sign',
      memberFromSigned: 'Member from {locale} signed',
    },
    de: {
      youSigned: 'Sie haben unterschrieben',
      beTheFirstToSign: 'Unterschreiben Sie als Erste/r!',
      memberFromSigned: 'Mitglied aus {locale} hat unterschrieben',
    },
    fr: {
      youSigned: 'Vous avez signé',
      beTheFirstToSign: 'Soyez la première personne à signer',
      memberFromSigned: 'Un membre de {locale} a signé',
    },
  },
})
export function SignatoriesCarousel({
  autoplayDelay = 2000,
  className,
  lastSignatures,
}: SignatoriesCarouselProps) {
  const { t } = useTranslation(i18nMessages, 'SignatoriesCarousel')
  const { petitionUserAction, isOptimisticSigned } = useSignature()

  const allSignatures = useMemo(() => {
    const signatures = [...lastSignatures]

    const userSignedDate =
      petitionUserAction?.datetimeCreated || (isOptimisticSigned ? new Date().toISOString() : null)
    if (userSignedDate) {
      signatures.push({
        datetimeSigned: userSignedDate,
        isUserSignature: true,
      })
    }

    return signatures.sort((a, b) => {
      const timeDiff = new Date(b.datetimeSigned).getTime() - new Date(a.datetimeSigned).getTime()
      return timeDiff !== 0 ? timeDiff : a.isUserSignature ? -1 : b.isUserSignature ? 1 : 0
    })
  }, [lastSignatures, petitionUserAction?.datetimeCreated, isOptimisticSigned])

  const shouldRenderList = allSignatures.length >= MIN_SIGNATURES_TO_RENDER_LIST

  return (
    <div className={cn('w-full', className)}>
      <BadgesAutomaticCarousel.Root autoplayDelay={autoplayDelay}>
        <BadgesAutomaticCarousel.Content>
          {shouldRenderList ? (
            allSignatures.map((signature, index) => (
              <BadgesAutomaticCarousel.Item
                className="flex items-center gap-2"
                key={
                  signature.isUserSignature
                    ? 'user-signature'
                    : `${signature.locale}-${signature.datetimeSigned}-${index}`
                }
                variant="muted"
              >
                <span className="flex items-center gap-2 text-xs text-primary-cta">
                  <Edit3 className="h-4 w-4" />
                  {signature.isUserSignature
                    ? t('youSigned')
                    : t('memberFromSigned', { locale: signature.locale })}
                </span>
                <span className="text-xs text-muted-foreground">
                  <FormattedRelativeDatetime
                    date={new Date(signature.datetimeSigned)}
                    timeFormatStyle="narrow"
                  />
                </span>
              </BadgesAutomaticCarousel.Item>
            ))
          ) : (
            <BadgesAutomaticCarousel.Item variant="muted">
              <span className="flex items-center gap-2 text-xs text-primary-cta">
                <Edit3 className="h-4 w-4" />
                {t('beTheFirstToSign')}
              </span>
            </BadgesAutomaticCarousel.Item>
          )}
        </BadgesAutomaticCarousel.Content>
        {shouldRenderList && <BadgesAutomaticCarousel.Fade />}
      </BadgesAutomaticCarousel.Root>
    </div>
  )
}
