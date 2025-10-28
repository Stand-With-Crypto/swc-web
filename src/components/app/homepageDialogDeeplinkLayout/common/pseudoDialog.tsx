import 'server-only'

import React from 'react'
import { X } from 'lucide-react'

import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export interface PseudoDialogProps extends React.PropsWithChildren {
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
  size?: 'sm' | 'md'
  className?: string
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      close: 'Close',
    },
    fr: {
      close: 'Fermer',
    },
    de: {
      close: 'Schließen',
    },
  },
})

export function PseudoDialog({
  children,
  countryCode,
  size = 'md',
  language = SupportedLanguages.EN,
  className,
}: PseudoDialogProps) {
  const urls = getIntlUrls(countryCode, { language })
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return (
    <>
      <InternalLink
        className={cn(dialogOverlayStyles, 'cursor-default')}
        href={urls.home()}
        replace
      />
      <div
        className={cn(
          dialogContentStyles,
          size === 'md' && 'max-w-3xl',
          'min-h-[400px]',
          className,
        )}
      >
        <ScrollArea className="overflow-auto md:max-h-[90vh]">{children}</ScrollArea>
        <InternalLink className={dialogCloseStyles} href={urls.home()} replace>
          <X size={20} />
          <span className="sr-only">{t('close')}</span>
        </InternalLink>
      </div>
    </>
  )
}
