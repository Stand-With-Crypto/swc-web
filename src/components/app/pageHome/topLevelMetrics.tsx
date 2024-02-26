'use client'
import { useMemo } from 'react'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { roundDownNumberToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { cn } from '@/utils/web/cn'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

type Props = Pick<
  Awaited<ReturnType<typeof getHomepageData>>,
  'countPolicymakerContacts' | 'countUsers' | 'sumDonations'
> & { locale: SupportedLocale }

const mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease = (
  initial: Omit<Props, 'locale'>,
): Omit<Props, 'locale'> => ({
  sumDonations: {
    amountUsd: roundDownNumberToAnimateIn(initial.sumDonations.amountUsd, 10000),
  },
  countUsers: {
    count: roundDownNumberToAnimateIn(initial.countUsers.count, 100),
  },
  countPolicymakerContacts: {
    countUserActionCalls: roundDownNumberToAnimateIn(
      initial.countPolicymakerContacts.countUserActionCalls,
      100,
    ),
    countUserActionEmails: roundDownNumberToAnimateIn(
      initial.countPolicymakerContacts.countUserActionEmails,
      100,
    ),
    hardcodedCountSum: roundDownNumberToAnimateIn(
      initial.countPolicymakerContacts.hardcodedCountSum,
      100,
    ),
  },
})

export function TopLevelMetrics({ locale, ...data }: Props & { locale: SupportedLocale }) {
  const decreasedInitialValues = useMemo(
    () => mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease(data),
    [data],
  )
  const values = useApiHomepageTopLevelMetrics(decreasedInitialValues).data
  const formatted = useMemo(() => {
    return {
      sumDonations: {
        amountUsd: intlNumberFormat(locale, {
          style: 'currency',
          currency: SupportedFiatCurrencyCodes.USD,
          maximumFractionDigits: 0,
        }).format(values.sumDonations.amountUsd),
      },
      countUsers: {
        count: intlNumberFormat(locale).format(values.countUsers.count),
      },
      countPolicymakerContacts: {
        count: intlNumberFormat(locale).format(
          values.countPolicymakerContacts.countUserActionEmails +
            values.countPolicymakerContacts.countUserActionCalls +
            values.countPolicymakerContacts.hardcodedCountSum,
        ),
      },
    }
  }, [values, locale])
  return (
    <section className="mb-16 flex flex-col gap-3 text-center md:mb-24 md:flex-row md:gap-0">
      {[
        {
          label: 'Donated by crypto advocates',
          value: (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="mx-auto block" style={{ height: 35 }}>
                  <AnimatedNumericOdometer size={35} value={formatted.sumDonations.amountUsd} />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs" side="bottom">
                  <p className="text-sm font-normal tracking-normal">
                    Total includes donations to Stand With Crypto Alliance and to Fairshake, a
                    pro-crypto Super PAC.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
        {
          label: 'Crypto advocates',
          value: <AnimatedNumericOdometer size={35} value={formatted.countUsers.count} />,
        },
        {
          label: 'Policymaker contacts',
          value: (
            <AnimatedNumericOdometer size={35} value={formatted.countPolicymakerContacts.count} />
          ),
        },
      ].map(({ label, value }, index) => (
        <div
          className={cn(
            'w-full flex-shrink-0 rounded-3xl bg-blue-50 p-6 md:w-1/3',
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
    </section>
  )
}
