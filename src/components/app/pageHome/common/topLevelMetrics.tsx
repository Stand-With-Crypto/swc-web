'use client'
import { useCallback, useMemo, useState } from 'react'
import { Info } from 'lucide-react'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { roundDownNumberToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

interface TopLevelMetricsProps
  extends Pick<
    Awaited<ReturnType<typeof getHomepageData>>,
    'countPolicymakerContacts' | 'countUsers' | 'sumDonations'
  > {
  countryCode: SupportedCountryCodes
  disableTooltips?: boolean
  useGlobalLabels?: boolean
}

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
  countryCode,
  disableTooltips = false,
  useGlobalLabels = false,
  ...data
}: TopLevelMetricsProps) {
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
      return intlNumberFormat(COUNTRY_CODE_TO_LOCALE[countryCode], {
        style: 'currency',
        currency: SupportedFiatCurrencyCodes.USD,
        maximumFractionDigits,
        notation,
      }).format(value)
    },
    [countryCode],
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
        count: intlNumberFormat(COUNTRY_CODE_TO_LOCALE[countryCode]).format(
          values.countUsers.count,
        ),
      },
      countPolicymakerContacts: {
        count: intlNumberFormat(COUNTRY_CODE_TO_LOCALE[countryCode]).format(
          values.countPolicymakerContacts.countUserActionEmailRecipients +
            values.countPolicymakerContacts.countUserActionCalls +
            values.countPolicymakerContacts.hardcodedCountSum,
        ),
      },
    }
  }, [formatCurrency, values, countryCode])

  const globalDonationsRender = (
    <AnimatedNumericOdometer size={35} value={formatted.sumDonations.amountUsd} />
  )

  return (
    <div className="flex flex-col gap-3 text-center md:flex-row md:gap-0">
      {[
        {
          label: useGlobalLabels ? 'Global donations' : 'Donated by crypto advocates',
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
                    {formatted.sumDonations.compactFairshakeAmountUsd} donated to Fairshake, a
                    pro-crypto Super PAC, and {formatted.sumDonations.compactSWCAmountUsd} donated
                    to the Stand With Crypto 501(c)(4).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
        {
          label: useGlobalLabels ? 'Global advocates' : 'Crypto advocates',
          value: <AnimatedNumericOdometer size={35} value={formatted.countUsers.count} />,
        },
        {
          label: useGlobalLabels ? 'Global policymaker contacts' : 'Policymaker contacts',
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
