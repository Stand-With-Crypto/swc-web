'use client'
import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { cn } from '@/utils/web/cn'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

type Props = Pick<
  Awaited<ReturnType<typeof getHomepageData>>,
  'countPolicymakerContacts' | 'countUsers' | 'sumDonations'
> & { locale: SupportedLocale }

const mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease = (
  initial: Omit<Props, 'locale'>,
): Omit<Props, 'locale'> => ({
  sumDonations: {
    amountUsd: initial.sumDonations.amountUsd - 99,
  },
  countUsers: {
    count: initial.countUsers.count - 1,
  },
  countPolicymakerContacts: {
    countUserActionCalls: initial.countPolicymakerContacts.countUserActionCalls - 1,
    countUserActionEmailRecipients:
      initial.countPolicymakerContacts.countUserActionEmailRecipients - 1,
  },
})

export function TopLevelMetrics({ locale, ...data }: Props & { locale: SupportedLocale }) {
  const decreasedInitialValues = useMemo(
    () => mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease(data),
    [data],
  )
  const values = useApiHomepageTopLevelMetrics(decreasedInitialValues).data
  const isUsingDecreasedInitialValues =
    decreasedInitialValues.sumDonations.amountUsd === values.sumDonations.amountUsd
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
    <section className="mb-16 flex flex-col gap-3 rounded-lg text-center md:mb-24 md:flex-row md:gap-0">
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
            'w-full flex-shrink-0 rounded-lg bg-blue-50 p-6 md:w-1/3',
            index === 0
              ? 'md:rounded-none md:rounded-l-lg'
              : index === 2
                ? 'md:rounded-none md:rounded-r-lg'
                : 'md:rounded-none',
          )}
          key={label}
        >
          <motion.div
            initial={{ opacity: 0.5 }}
            transition={{ duration: 1.5 }}
            animate={isUsingDecreasedInitialValues ? { opacity: 0.5 } : { opacity: 1 }}
          >
            {value}
          </motion.div>
          <motion.div className="text-gray-500">{label}</motion.div>
        </div>
      ))}
    </section>
  )
}
