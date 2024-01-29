'use client'
import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { cn } from '@/utils/web/cn'
import { useMemo } from 'react'

export function TopLevelMetrics({
  locale,
  ...data
}: Pick<
  Awaited<ReturnType<typeof getHomepageData>>,
  'countPolicymakerContacts' | 'countUsers' | 'sumDonations'
> & { locale: SupportedLocale }) {
  const values = useApiHomepageTopLevelMetrics(data).data

  const formatted = useMemo(() => {
    return {
      sumDonations: {
        amountUsd: new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: SupportedFiatCurrencyCodes.USD,
          maximumFractionDigits: 0,
        }).format(values.sumDonations.amountUsd),
      },
      countUsers: {
        count: new Intl.NumberFormat(locale).format(values.countUsers.count),
      },
      countPolicymakerContacts: {
        count: new Intl.NumberFormat(locale).format(
          values.countPolicymakerContacts.countUserActionCalls +
            values.countPolicymakerContacts.countUserActionCalls,
        ),
      },
    }
  }, [values, locale])
  return (
    <section className="mb-16 flex flex-col gap-3 rounded-lg text-center sm:flex-row sm:gap-0 md:mb-24">
      {[
        {
          label: 'Donated by crypto advocates',
          value: (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger style={{ height: 35 }} className="mx-auto block">
                  <AnimatedNumericOdometer size={35} value={formatted.sumDonations.amountUsd} />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm font-normal tracking-normal">
                    Total includes donations to Stand with Crypto Alliance and to Fairshake, a
                    pro-crypto Super PAC.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
        {
          label: 'Crypto advocates',
          value: (
            <div>
              <AnimatedNumericOdometer size={35} value={formatted.countUsers.count} />
            </div>
          ),
        },
        {
          label: 'Policymaker contacts',
          value: (
            <div>
              <AnimatedNumericOdometer size={35} value={formatted.countPolicymakerContacts.count} />
            </div>
          ),
        },
      ].map(({ label, value }, index) => (
        <div
          className={cn(
            'w-full flex-shrink-0 rounded-lg bg-blue-50 p-6 sm:w-1/3',
            index === 0
              ? 'rounded-none sm:rounded-l-lg'
              : index === 2
                ? 'rounded-none sm:rounded-r-lg'
                : 'rounded-none',
          )}
          key={label}
        >
          {value}
          <div className="text-gray-500">{label}</div>
        </div>
      ))}
    </section>
  )
}
