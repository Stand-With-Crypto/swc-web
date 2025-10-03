'use client'

import { ReactNode } from 'react'

import { ReferralsCounter } from '@/components/app/pageReferrals/common/referralsCounter'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/common/userReferralUrl'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { PageTitle } from '@/components/ui/pageTitleText'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export function Refer({ children }: { children: ReactNode }) {
  return (
    <UserActionFormLayout className="min-h-max">
      <UserActionFormLayout.Container className="h-auto items-center justify-around">
        {children}
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      inviteTitle: 'Invite a friend to join',
      inviteDescription: 'Stand With Crypto',
    },
    de: {
      inviteTitle: 'Einen Freund einladen, um sich anzumelden',
      inviteDescription: 'Stand With Crypto',
    },
    fr: {
      inviteTitle: "Inviter un ami à s'inscrire",
      inviteDescription: 'Stand With Crypto',
    },
  },
})

Refer.Heading = function ReferHeading({ description }: { description: string }) {
  const { t } = useTranslation(i18nMessages, 'ReferHeading')

  return (
    <div className="flex w-full flex-col gap-2 text-center">
      <div>
        <PageTitle size="sm">{t('inviteTitle')}</PageTitle>
        <PageTitle size="sm">{t('inviteDescription')}</PageTitle>
      </div>
      <p className="text-fontcolor-muted">{description}</p>
    </div>
  )
}

Refer.ReferralCode = function ReferralCode() {
  return <UserReferralUrlWithApi />
}

Refer.Counter = ReferralsCounter
