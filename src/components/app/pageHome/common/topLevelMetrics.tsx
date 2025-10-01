'use client'
import { useCallback, useMemo, useState } from 'react'
import { Info } from 'lucide-react'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { roundDownNumberToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { getLocaleForLanguage } from '@/utils/shared/i18n/interpolationUtils'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

interface TopLevelMetricsProps
  extends Pick<
    Awaited<ReturnType<typeof getHomepageData>>,
    'countPolicymakerContacts' | 'countUsers' | 'sumDonations'
  > {
  disableTooltips?: boolean
  useGlobalLabels?: boolean
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      globalDonations: 'Global donations',
      globalAdvocates: 'Global advocates',
      cryptoAdvocates: 'Crypto advocates',
      donatedByCryptoAdvocates: 'Donated by crypto advocates',
      globalPolicymakerContacts: 'Global policymaker contacts',
      policymakerContacts: 'Policymaker contacts',
      donationTooltip:
        '{amountToFairshake} donated to Fairshake, a pro-crypto Super PAC, and {amountToSWC} donated to the Stand With Crypto 501(c)(4).',
    },
    fr: {
      globalDonations: 'Dons mondiaux',
      globalAdvocates: 'Défenseurs mondiaux',
      cryptoAdvocates: 'Défenseurs crypto',
      donatedByCryptoAdvocates: 'Donné par les défenseurs crypto',
      globalPolicymakerContacts: 'Contacts de décideurs mondiaux',
      policymakerContacts: 'Contacts de décideurs',
      donationTooltip:
        '{amountToFairshake} donné à Fairshake, un Super PAC pro-crypto, et {amountToSWC} donné à Stand With Crypto 501(c)(4).',
    },
    de: {
      globalDonations: 'Globale Spenden',
      globalAdvocates: 'Globale Befürworter',
      cryptoAdvocates: 'Krypto-Befürworter',
      donatedByCryptoAdvocates: 'Von Krypto-Befürwortern gespendet',
      globalPolicymakerContacts: 'Globale Politikkontakte',
      policymakerContacts: 'Politikkontakte',
      donationTooltip:
        '{amountToFairshake} an Fairshake gespendet, ein pro-Krypto Super PAC, und {amountToSWC} an Stand With Crypto 501(c)(4) gespendet.',
    },
  },
})

const mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease = (
  initial: Omit<TopLevelMetricsProps, 'countryCode'>,
): Omit<TopLevelMetricsProps, 'countryCode'> => ({
  sumDonations: {
    amountUsd: roundDownNumberToAnimateIn(initial.sumDonations.amountUsd, 10000),
    fairshakeAmountUsd: roundDownNumberToAnimateIn(initial.sumDonations.fairshakeAmountUsd, 10000),
  },
  countUsers: {
    count: roundDownNumberToAnimateIn(initial.countUsers.count, 100),
  },
  countPolicymakerContacts: {
    countUserActionCalls: roundDownNumberToAnimateIn(
      initial.countPolicymakerContacts.countUserActionCalls,
      100,
    ),
    countUserActionEmailRecipients: roundDownNumberToAnimateIn(
      initial.countPolicymakerContacts.countUserActionEmailRecipients,
      100,
    ),
    hardcodedCountSum: roundDownNumberToAnimateIn(
      initial.countPolicymakerContacts.hardcodedCountSum,
      100,
    ),
  },
})

export function TopLevelMetrics({
  disableTooltips = false,
  useGlobalLabels = false,
  ...data
}: TopLevelMetricsProps) {
  const { t, language } = useTranslation(i18nMessages, 'topLevelMetrics')

  const locale = getLocaleForLanguage(language)

  const [isDonatedTooltipOpen, setIsDonatedTooltipOpen] = useState(false)
  const decreasedInitialValues = useMemo(
    () => mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease(data),
    [data],
  )
  const values = useApiHomepageTopLevelMetrics({
    initial: decreasedInitialValues,
  }).data

  const formatCurrency = useCallback(
    (
      value: number,
      notation?: Intl.NumberFormatOptions['notation'],
      maximumFractionDigits: number = 0,
    ) => {
      return intlNumberFormat(locale, {
        style: 'currency',
        currency: SupportedFiatCurrencyCodes.USD,
        maximumFractionDigits,
        notation,
      }).format(value)
    },
    [locale],
  )

  const formatted = useMemo(() => {
    return {
      sumDonations: {
        amountUsd: formatCurrency(values.sumDonations.amountUsd),
        compactSWCAmountUsd: formatCurrency(
          values.sumDonations.amountUsd - values.sumDonations.fairshakeAmountUsd,
          'compact',
          2,
        ),
        compactFairshakeAmountUsd: formatCurrency(
          values.sumDonations.fairshakeAmountUsd,
          'compact',
          2,
        ),
      },
      countUsers: {
        count: intlNumberFormat(locale).format(values.countUsers.count),
      },
      countPolicymakerContacts: {
        count: intlNumberFormat(locale).format(
          values.countPolicymakerContacts.countUserActionEmailRecipients +
            values.countPolicymakerContacts.countUserActionCalls +
            values.countPolicymakerContacts.hardcodedCountSum,
        ),
      },
    }
  }, [formatCurrency, values, locale])

  const globalDonationsRender = (
    <AnimatedNumericOdometer size={35} value={formatted.sumDonations.amountUsd} />
  )

  return (
    <div className="flex flex-col gap-3 text-center md:flex-row md:gap-0">
      {[
        {
          label: useGlobalLabels ? t('globalDonations') : t('donatedByCryptoAdvocates'),
          value: disableTooltips ? (
            globalDonationsRender
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip onOpenChange={setIsDonatedTooltipOpen} open={isDonatedTooltipOpen}>
                <TooltipTrigger
                  className="mx-auto flex gap-1"
                  onClick={() => setIsDonatedTooltipOpen(true)}
                  style={{ height: 35 }}
                >
                  {globalDonationsRender}
                  <sup>
                    <Info className="h-4 w-4" />
                  </sup>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs" side="bottom">
                  <p className="text-sm font-normal tracking-normal">
                    {t('donationTooltip', {
                      amountToFairshake: formatted.sumDonations.compactFairshakeAmountUsd,
                      amountToSWC: formatted.sumDonations.compactSWCAmountUsd,
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
        {
          label: useGlobalLabels ? t('globalAdvocates') : t('cryptoAdvocates'),
          value: <AnimatedNumericOdometer size={35} value={formatted.countUsers.count} />,
        },
        {
          label: useGlobalLabels ? t('globalPolicymakerContacts') : t('policymakerContacts'),
          value: (
            <AnimatedNumericOdometer size={35} value={formatted.countPolicymakerContacts.count} />
          ),
        },
      ].map(({ label, value }, index) => (
        <div
          className={cn(
            'w-full flex-shrink-0 rounded-3xl bg-secondary p-6 md:w-1/3',
            index === 0
              ? 'md:rounded-none md:rounded-l-3xl'
              : index === 2
                ? 'md:rounded-none md:rounded-r-3xl'
                : 'md:rounded-none',
          )}
          key={label}
        >
          <div>{value}</div>
          <div className="text-gray-500">{label}</div>
        </div>
      ))}
    </div>
  )
}
