import { lazy } from 'react'
import { getYear } from 'date-fns'

import { CookieConsentFooterButton } from '@/components/app/cookieConsent/common/cookieConsentFooterButton'
import { HeroCTA } from '@/components/app/pageHome/common/hero/heroCTA'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { DEFAULT_PAGE_TITLE_SIZE, PageTitle } from '@/components/ui/pageTitleText'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { cn } from '@/utils/web/cn'

const SendFeedbackButton = lazy(() =>
  import('@/components/app/footer/sendFeedback').then(m => ({
    default: m.SendFeedbackButton,
  })),
)

const footerLinkStyles = cn('block text-gray-400')

export interface FooterProps {
  countryCode: SupportedCountryCodes
  title: string
  subtitle: string
  links: {
    text: string
    href: string
  }[]
  socialLinks: {
    text: string
    href: string
  }[]
  sendFeedbackLink?: string
  legalText?: string
  footerBanner?: React.ReactNode
  language?: SupportedLanguages
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      rightsReserved: 'Stand With Crypto ©️ All rights reserved',
    },
    de: {
      rightsReserved: 'Stand With Crypto ©️ Alle Rechte vorbehalten',
    },
    fr: {
      rightsReserved: 'Stand With Crypto ©️ Tous droits réservés',
    },
  },
})

export function Footer({
  title,
  subtitle,
  links,
  socialLinks,
  sendFeedbackLink,
  footerBanner,
  countryCode,
  legalText,
  language = SupportedLanguages.EN,
}: FooterProps) {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return (
    <div className="mt-36">
      {footerBanner}
      <footer className="bg-black py-24 text-muted antialiased">
        <div className="container">
          <div className="flex flex-col gap-9 lg:flex-row lg:justify-between">
            <div className="max-w-2xl space-y-8">
              <PageTitle as="h6" className="text-left" size={DEFAULT_PAGE_TITLE_SIZE}>
                {title}
              </PageTitle>
              <p className="text-xl">{subtitle}</p>
              <HeroCTA countryCode={countryCode} darkMode />
            </div>
            <div className="mb-10 grid max-w-xl flex-shrink-0 grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-6">
                {socialLinks.map(({ text, href }) => (
                  <ExternalLink className={footerLinkStyles} href={href} key={href}>
                    {text}
                  </ExternalLink>
                ))}
                {sendFeedbackLink && <SendFeedbackButton href={sendFeedbackLink} />}
              </div>
              <div className="space-y-3 sm:space-y-6">
                {links.map(({ text, href }) => (
                  <InternalLink className={footerLinkStyles} href={href} key={href}>
                    {text}
                  </InternalLink>
                ))}
                <CookieConsentFooterButton
                  className={cn(footerLinkStyles, 'h-auto text-wrap p-0 text-left text-base')}
                  variant={'link'}
                />
              </div>
            </div>
          </div>

          {legalText && <div className="mt-4 text-sm text-muted">{legalText}</div>}

          <div className="mt-4 text-sm text-muted">
            {t('rightsReserved')} {getYear(new Date())}
          </div>
        </div>
      </footer>
    </div>
  )
}
