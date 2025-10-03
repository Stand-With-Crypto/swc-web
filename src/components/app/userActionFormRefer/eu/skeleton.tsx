'use client'

import { UserActionFormReferSkeleton } from '@/components/app/userActionFormRefer/common/skeleton'
import { NextImage } from '@/components/ui/image'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      alt: 'Refer a friend',
    },
    de: {
      alt: 'Einen Freund empfehlen',
    },
    fr: {
      alt: 'Parrainer un ami',
    },
  },
})

export const EUUserActionFormReferSkeleton = () => {
  const { t } = useTranslation(i18nMessages, 'EUUserActionFormReferSkeleton')

  return (
    <UserActionFormReferSkeleton>
      <NextImage
        alt={t('alt')}
        className="object-contain drop-shadow-md"
        height={100}
        src="/actionTypeIcons/refer.png"
        width={100}
      />
    </UserActionFormReferSkeleton>
  )
}
