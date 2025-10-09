import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useEffectOnce } from '@/hooks/useEffectOnce'
import {
  COUNTRY_CODE_TO_DEMONYM_KEY,
  COUNTRY_CODE_TO_DISPLAY_NAME_KEY,
  withI18nCommons,
} from '@/utils/shared/i18n/commons'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { trackPrimitiveComponentAnalytics } from '@/utils/web/primitiveComponentAnalytics'

const ANALYTICS_NAME_USER_ACTION_FORM_UNAVAILABLE = 'User Action Form Unavailable'

interface UserActionFormActionUnavailableProps {
  onConfirm?: () => void
  countryCode: SupportedCountryCodes
  className?: string
  hideTitle?: boolean
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Action unavailable',
      description:
        "We've detected that you may not be located in {countryName}. Certain actions and tools on SWC are intended only for {countryDemonym} advocates.",
      backToHome: 'Back to Home',
    },
    de: {
      title: 'Aktion nicht verfügbar',
      description:
        'Wir haben festgestellt, dass Sie sich möglicherweise nicht in {countryName} befinden. Bestimmte Aktionen und Tools auf SWC sind nur für {countryDemonym} Befürworter vorgesehen.',
      backToHome: 'Zurück zur Startseite',
    },
    fr: {
      title: 'Action non disponible',
      description:
        "Nous avons détecté que vous n'êtes peut-être pas situé en {countryName}. Certaines actions et outils sur SWC sont destinés uniquement aux défenseurs {countryDemonym}.",
      backToHome: "Retour à l'accueil",
    },
  },
})

export const UserActionFormActionUnavailable = ({
  onConfirm,
  countryCode,
  className,
  hideTitle = false,
}: UserActionFormActionUnavailableProps) => {
  const { t } = useTranslation(withI18nCommons(i18nMessages), 'UserActionFormActionUnavailable')

  useEffectOnce(() => {
    trackPrimitiveComponentAnalytics(
      ({ properties, args }) => {
        trackClientAnalytic('User Action Unavailable', {
          action: AnalyticActionType.view,
          component: AnalyticComponentType.text,
          ...properties,
          ...args,
        })
      },
      {
        args: {
          ...(countryCode ? { 'Country Code': countryCode } : {}),
        },
        analytics: ANALYTICS_NAME_USER_ACTION_FORM_UNAVAILABLE,
      },
    )
  })

  return (
    <div
      className={cn('flex min-h-[500px] flex-col items-center justify-center space-y-8', className)}
    >
      {!hideTitle && <PageTitle size="sm">{t('title')}</PageTitle>}
      <PageSubTitle>
        {t('description', {
          countryName: t(COUNTRY_CODE_TO_DISPLAY_NAME_KEY[countryCode]),
          countryDemonym: t(COUNTRY_CODE_TO_DEMONYM_KEY[countryCode]),
        })}
      </PageSubTitle>
      <Button asChild onClick={onConfirm}>
        <InternalLink href="/">{t('backToHome')}</InternalLink>
      </Button>
    </div>
  )
}
