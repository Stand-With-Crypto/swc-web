import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { cn } from '@/utils/web/cn'

export function TopLevelMetrics({
  locale,
  ...data
}: Pick<
  Awaited<ReturnType<typeof getHomepageData>>,
  'countPolicymakerContacts' | 'countUsers' | 'sumDonations'
> & { locale: SupportedLocale }) {
  const { sumDonations, countPolicymakerContacts, countUsers } =
    useApiHomepageTopLevelMetrics(data).data
  return (
    <section className="mb-16 flex flex-col gap-3 rounded-lg text-center sm:flex-row sm:gap-0 md:mb-24">
      {[
        {
          label: 'Donated by crypto advocates',
          value: (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <FormattedCurrency
                    amount={sumDonations.amountUsd + 78000000}
                    currencyCode={SupportedFiatCurrencyCodes.USD}
                    locale={locale}
                  />
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
          value: <FormattedNumber locale={locale} amount={countUsers.count} />,
        },
        {
          label: 'Policymaker contacts',
          value: (
            <FormattedNumber
              locale={locale}
              amount={
                countPolicymakerContacts.countUserActionCalls +
                countPolicymakerContacts.countUserActionEmailRecipients
              }
            />
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
          <div className="text-2xl font-bold tracking-wider">{value}</div>
          <div className="text-gray-500">{label}</div>
        </div>
      ))}
    </section>
  )
}
