'use client'

import React from 'react'
import { Check } from 'lucide-react'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { Button } from '@/components/ui/button'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export function ShareOnX({ children }: React.PropsWithChildren) {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container className="h-auto items-center justify-between">
        {children}
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <UserActionFormLayout.Heading subtitle={subtitle} title={title} />
}
ShareOnX.Heading = Heading

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      byFollowingSWC: 'By following Stand With Crypto, you are:',
    },
    fr: {
      byFollowingSWC: 'En suivant Stand With Crypto, vous êtes :',
    },
    de: {
      byFollowingSWC: 'Durch das Folgen von Stand With Crypto sind Sie :',
    },
  },
})

function Benefits({ benefits }: { benefits: string[] }) {
  const { t } = useTranslation(i18nMessages, 'ShareOnX.Benefits')

  return (
    <div>
      <p className="mb-4">{t('byFollowingSWC')}</p>

      <ul className="space-y-2">
        {benefits.map((info: string) => (
          <li className="flex items-center gap-4" key={info}>
            <Check size={20} />
            <span>{info}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
ShareOnX.Benefits = Benefits

function SubmitButton({
  text,
  onClick,
  className,
}: {
  text: string
  onClick: () => void
  className?: string
}) {
  return (
    <Button className={`w-full max-w-[450px] ${className || ''}`} onClick={onClick} size="lg">
      {text}
    </Button>
  )
}
ShareOnX.SubmitButton = SubmitButton
