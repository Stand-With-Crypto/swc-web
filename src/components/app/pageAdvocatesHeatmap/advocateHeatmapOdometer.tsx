'use client'

import { useMemo } from 'react'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { roundDownNumberByGranularityToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { useIsMobile } from '@/hooks/useIsMobile'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

const mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease = (
  countUsers: number,
): GetHomepageTopLevelMetricsResponse => ({
  countUsers: {
    us: 0,
    gb: 0,
    ca: 0,
    au: 0,
    total: roundDownNumberByGranularityToAnimateIn(countUsers, 100000),
  },
  sumDonations: {
    amountUsd: 0,
    fairshakeAmountUsd: 0,
  },
  countPolicymakerContacts: {
    countUserActionEmailRecipients: 0,
    countUserActionCalls: 0,
    hardcodedCountSum: 0,
  },
})

export function AdvocateHeatmapOdometer({
  countryCode,
  countUsers,
  className,
}: {
  countryCode: SupportedCountryCodes
  countUsers: number
  className?: string
}) {
  const isMobile = useIsMobile()
  const decreasedInitialValues = useMemo(
    () => mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease(countUsers),
    [countUsers],
  )
  const values = useApiHomepageTopLevelMetrics({
    initial: decreasedInitialValues,
  }).data

  const formatted = useMemo(() => {
    return {
      countUsers: {
        count: intlNumberFormat(COUNTRY_CODE_TO_LOCALE[countryCode]).format(
          values.countUsers.total,
        ),
      },
    }
  }, [values.countUsers.total, countryCode])

  return (
    <div className={cn(`flex-shrink-0 bg-secondary px-0 py-2 text-center`, className)}>
      <AnimatedNumericOdometer
        numberSpanClassName="!font-sans -mr-2 w-min last:mr-0"
        size={isMobile ? 46 : 76}
        value={formatted.countUsers.count}
      />
      <div className="text-end font-sans text-lg text-muted-foreground md:text-xl">
        Global Advocates
      </div>
    </div>
  )
}
