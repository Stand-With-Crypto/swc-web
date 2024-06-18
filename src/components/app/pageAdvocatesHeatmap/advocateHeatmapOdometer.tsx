'use client'

import { useMemo } from 'react'

import { TotalAdvocatesProps } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap.types'
import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import odometerStyles from '@/components/ui/animatedNumericOdometer/odometer.module.css'
import { roundDownNumberByGranularityToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import {
  getHomepageData,
  GetHomepageTopLevelMetricsResponse,
} from '@/data/pageSpecific/getHomepageData'
import { useApiHomepageTopLevelMetrics } from '@/hooks/useApiHomepageTopLevelMetrics'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedLocale } from '@/intl/locales'
import { cn } from '@/utils/web/cn'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

const mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease = (
  initial: Omit<TotalAdvocatesProps, 'locale' | 'sumDonations' | 'countPolicymakerContacts'>,
): Omit<TotalAdvocatesProps, 'locale' | 'sumDonations' | 'countPolicymakerContacts'> => ({
  countUsers: {
    count: roundDownNumberByGranularityToAnimateIn(initial.countUsers.count, 100000),
  },
})

export function AdvocateHeatmapOdometer({
  locale,
  homepageData,
  className,
}: {
  locale: SupportedLocale
  homepageData: Awaited<ReturnType<typeof getHomepageData>>
  className?: string
}) {
  const isMobile = useIsMobile()
  const decreasedInitialValues = useMemo(
    () => mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease(homepageData),
    [homepageData],
  )
  const values = useApiHomepageTopLevelMetrics(
    decreasedInitialValues as GetHomepageTopLevelMetricsResponse,
  ).data
  const formatted = useMemo(() => {
    return {
      countUsers: {
        count: intlNumberFormat(locale).format(values.countUsers.count),
      },
    }
  }, [values, locale])

  return (
    <div
      className={cn(
        `flex-shrink-0 rounded-3xl bg-secondary px-0 py-4 text-center md:p-6 md:py-6 ${className ?? ''}`,
      )}
    >
      <AnimatedNumericOdometer
        className={odometerStyles.odometerSatoshi}
        size={isMobile ? 46 : 76}
        value={formatted.countUsers.count}
      />
      <div className="text-end font-sans text-lg text-muted-foreground md:text-xl">Advocates</div>
    </div>
  )
}
