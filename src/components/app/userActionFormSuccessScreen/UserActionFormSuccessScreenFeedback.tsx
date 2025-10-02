import { ReactNode } from 'react'
import { UserActionType } from '@prisma/client'

import { getUserActionFormSuccessScreenInfo } from '@/components/app/userActionFormSuccessScreen/constants'
import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { useCountryCode } from '@/hooks/useCountryCode'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useLanguage } from '@/utils/web/i18n/useLanguage'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export interface UserActionFormSuccessScreenFeedbackProps {
  image?: ReactNode
  title?: ReactNode
  description?: ReactNode
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      alt: 'Shield with checkmark',
      niceWork: 'Nice work!',
    },
    de: {
      alt: 'Schild mit Häkchen',
      niceWork: 'Gute Arbeit!',
    },
    fr: {
      alt: 'Badge avec coche',
      niceWork: 'Bon travail!',
    },
  },
})

export function UserActionFormSuccessScreenFeedback(
  props: UserActionFormSuccessScreenFeedbackProps,
) {
  const { image, title, description } = props

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <UserActionFormSuccessScreenFeedback.Image>{image}</UserActionFormSuccessScreenFeedback.Image>

      <div className="space-y-2">
        <UserActionFormSuccessScreenFeedback.Title>
          {title}
        </UserActionFormSuccessScreenFeedback.Title>
        <UserActionFormSuccessScreenFeedback.Description>
          {description}
        </UserActionFormSuccessScreenFeedback.Description>
      </div>
    </div>
  )
}

const UserActionFormSuccessScreenDefaultImage = () => {
  const { t } = useTranslation(i18nMessages, 'UserActionFormSuccessScreenDefaultImage')
  return <NextImage alt={t('alt')} height={120} src="/misc/swc-shield-checkmark.svg" width={120} />
}

UserActionFormSuccessScreenFeedback.Image = function UserActionFormSuccessScreenFeedbackImage({
  children,
}: {
  children: ReactNode
}) {
  return <div className="mx-auto">{children || <UserActionFormSuccessScreenDefaultImage />}</div>
}

UserActionFormSuccessScreenFeedback.Title = function UserActionFormSuccessScreenFeedbackTitle({
  children,
}: {
  children: ReactNode
}) {
  const { t } = useTranslation(i18nMessages, 'UserActionFormSuccessScreenFeedbackTitle')
  return <PageTitle size="sm">{children || t('niceWork')}</PageTitle>
}

UserActionFormSuccessScreenFeedback.Description =
  function UserActionFormSuccessScreenFeedbackDescription({ children }: { children: ReactNode }) {
    const countryCode = useCountryCode()
    const language = useLanguage()

    const info = getUserActionFormSuccessScreenInfo({
      actionType: UserActionType.LINKEDIN,
      countryCode,
      language,
    })

    return (
      <PageSubTitle className="max-w-lg" size="md">
        {children || info.description}
      </PageSubTitle>
    )
  }

UserActionFormSuccessScreenFeedback.Skeleton =
  function UserActionFormSuccessScreenFeedbackSkeleton() {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <Skeleton className="h-[180px] w-[345px] rounded-xl" />
        <Skeleton className="h-8 w-full max-w-xs" />

        <div className="flex w-full flex-col items-center gap-2">
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      </div>
    )
  }
