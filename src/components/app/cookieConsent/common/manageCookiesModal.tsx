import React, { useMemo } from 'react'
import { DialogProps } from '@radix-ui/react-dialog'

import {
  CookiePreferencesFieldConfig,
  CookiePreferencesForm,
} from '@/components/app/cookieConsent/common/cookiePreferencesForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { InternalLink } from '@/components/ui/link'
import { useDialog } from '@/hooks/useDialog'
import { useIsMobile } from '@/hooks/useIsMobile'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface ManageCookiesModalProps {
  children: React.ReactNode
  onSubmit: (accepted: CookieConsentPermissions) => void
  countryCode: SupportedCountryCodes
  defaultValues: CookieConsentPermissions
  fieldsConfig: CookiePreferencesFieldConfig[]
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Privacy Choices',
      remarketingTextStart:
        'We may engage in remarketing campaigns. This is a type of online advertising that directs advertising to individuals that have previously interacted with us. To opt-out of the use of your personal data for our remarketing campaigns, please email',
      remarketingIfInUsa: 'if you live in the USA, or',
      remarketingIfOutsideUSA: 'if you live outside the USA.',
      cookiePreferences: 'Cookie Preferences',
      privacyDisclaimer:
        'When you visit our website, we may store cookies on your browser to ensure the basic functionalities of the website, ensure your security, and to enhance your online experience, by helping us better understand user behavior and inform us about which parts of our website you have visited. Personal information, such as IP addresses or device identifiers, collected from our own and third-party cookies may be disclosed to our third-party partners, including our analytics and marketing partners. Blocking some types of cookies may impact your experience on the site. For more information, visit our',
      privacyPolicy: 'Privacy Policy',
    },
    fr: {
      title: 'Choix de confidentialité',
      remarketingTextStart:
        "Nous pouvons nous engager dans des campagnes de remarketing. Il s'agit d'un type de publicité en ligne qui dirige la publicité vers des individus qui ont précédemment interagi avec nous. Pour vous désinscrire de l'utilisation de vos données personnelles pour nos campagnes de remarketing, veuillez envoyer un e-mail à",
      remarketingIfInUsa: 'si vous vivez aux États-Unis, ou',
      remarketingIfOutsideUSA: 'si vous vivez en dehors des États-Unis.',
      cookiePreferences: 'Préférences des cookies',
      privacyDisclaimer:
        "Lorsque vous visitez notre site web, nous pouvons stocker des cookies sur votre navigateur pour assurer les fonctionnalités de base du site web, garantir votre sécurité et améliorer votre expérience en ligne, en nous aidant à mieux comprendre le comportement des utilisateurs et en nous informant sur les parties de notre site web que vous avez visitées. Les informations personnelles, telles que les adresses IP ou les identifiants d'appareils, collectées à partir de nos propres cookies et de cookies tiers peuvent être divulguées à nos partenaires tiers, y compris nos partenaires d'analyse et de marketing. Le blocage de certains types de cookies peut affecter votre expérience sur le site. Pour plus d'informations, visitez notre",
      privacyPolicy: 'Politique de confidentialité',
    },
    de: {
      title: 'Datenschutz-Optionen',
      remarketingTextStart:
        'Wir können Remarketing-Kampagnen durchführen. Dies ist eine Art von Online-Werbung, die Werbung an Personen richtet, die zuvor mit uns interagiert haben. Um sich von der Verwendung Ihrer persönlichen Daten für unsere Remarketing-Kampagnen abzumelden, senden Sie bitte eine E-Mail an',
      remarketingIfInUsa: 'wenn Sie in den USA leben, oder',
      remarketingIfOutsideUSA: 'wenn Sie außerhalb der USA leben.',
      cookiePreferences: 'Cookie-Einstellungen',
      privacyDisclaimer:
        'Wenn Sie unsere Website besuchen, können wir Cookies in Ihrem Browser speichern, um die grundlegenden Funktionen der Website zu gewährleisten, Ihre Sicherheit zu gewährleisten und Ihr Online-Erlebnis zu verbessern, indem wir das Nutzerverhalten besser verstehen und erfahren, welche Teile unserer Website Sie besucht haben. Persönliche Informationen wie IP-Adressen oder Gerätekennungen, die von unseren eigenen und Drittanbieter-Cookies gesammelt werden, können an unsere Drittanbieter-Partner, einschließlich unserer Analyse- und Marketing-Partner, weitergegeben werden. Das Blockieren bestimmter Cookie-Typen kann Ihr Erlebnis auf der Website beeinträchtigen. Weitere Informationen finden Sie in unserer',
      privacyPolicy: 'Datenschutzrichtlinie',
    },
  },
})

export function ManageCookiesModal({
  children,
  onSubmit,
  countryCode,
  defaultValues,
  fieldsConfig,
}: ManageCookiesModalProps) {
  const { t, language } = useTranslation(i18nMessages, 'ManageCookiesModal')

  const urls = useMemo(() => getIntlUrls(countryCode, { language }), [countryCode, language])
  const dialogProps = useDialog({ analytics: 'Cookie Consent Management' })
  const {
    isMobile,
    Container,
    ContainerTrigger,
    ContainerContent,
    ContainerHeader,
    ContainerTitle,
  } = useParentComponent()

  const handleManageCookiesSubmit = (values: CookieConsentPermissions) => {
    onSubmit(values)
    dialogProps.onOpenChange(false)
  }

  return (
    <Container {...dialogProps}>
      <ContainerTrigger asChild>{children}</ContainerTrigger>
      <ContainerContent a11yTitle={t('title')}>
        <ContainerHeader
          className={cn('space-y-6 px-0 pb-4', {
            'px-8': isMobile,
          })}
        >
          <ContainerTitle className="text-left">{t('title')}</ContainerTitle>
        </ContainerHeader>
        <div
          className={cn('space-y-6 px-0 pb-4', {
            'px-8': isMobile,
          })}
        >
          <p className="text-xs sm:text-sm">
            {t('remarketingTextStart')}{' '}
            <a className="text-primary-cta underline" href="mailto:info@standwithcrypto.org">
              info@standwithcrypto.org
            </a>{' '}
            {t('remarketingIfInUsa')}{' '}
            <a className="text-primary-cta underline" href="mailto:info@swcinternational.org">
              info@swcinternational.org
            </a>{' '}
            {t('remarketingIfOutsideUSA')}
          </p>
        </div>
        <ContainerHeader
          className={cn('space-y-6 px-0 pb-4', {
            'px-8': isMobile,
          })}
        >
          <ContainerTitle className="text-left">{t('cookiePreferences')}</ContainerTitle>
        </ContainerHeader>
        <div
          className={cn('space-y-6 px-0 pb-0', {
            'px-8': isMobile,
            'pb-8': isMobile,
          })}
        >
          <p className="text-xs sm:text-sm">
            {t('privacyDisclaimer')}{' '}
            <InternalLink className="underline" href={urls.privacyPolicy()}>
              {t('privacyPolicy')}
            </InternalLink>
            .
          </p>

          <CookiePreferencesForm
            defaultValues={defaultValues}
            fieldsConfig={fieldsConfig}
            onSubmit={handleManageCookiesSubmit}
          />
        </div>
      </ContainerContent>
    </Container>
  )
}

function useParentComponent() {
  const isMobile = useIsMobile()

  return React.useMemo(
    () => ({
      isMobile,
      Container: isMobile ? Drawer : Dialog,
      ContainerTrigger: isMobile ? DrawerTrigger : DialogTrigger,
      ContainerContent: isMobile
        ? DrawerContent
        : (props: DialogProps) => (
            <DialogContent a11yTitle="Cookie consent" {...props} className="max-w-lg" />
          ),
      ContainerHeader: isMobile ? DrawerHeader : DialogHeader,
      ContainerTitle: isMobile ? DrawerTitle : DialogTitle,
    }),
    [isMobile],
  )
}
